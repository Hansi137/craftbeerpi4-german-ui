// selftest.ino
//
// Eigenständiger Logik-Selbsttest für cooling_control.cpp und schedule.cpp.
// Braucht KEINEN Sensor, KEIN Relais, KEIN WLAN - nur das ESP32-Board per
// USB. Flashen, seriellen Monitor bei 115200 Baud öffnen, Ergebnis lesen.
//
// cooling_control.h/.cpp und schedule.h/.cpp liegen in DIESEM Ordner als
// 1:1-Kopien der Dateien aus src/ - Arduino (egal ob arduino-cli oder die
// Arduino IDE) kopiert ein Sketch beim Kompilieren in einen temporären
// Build-Ordner, wodurch #include-Pfade, die aus dem Sketch-Ordner
// herausführen (z.B. "../../src/..."), nicht zuverlässig funktionieren -
// deshalb bewusst lokale Kopien statt eines Verweises nach außen.
//
// WICHTIG: Wird die Logik in src/cooling_control.* oder src/schedule.*
// geändert, müssen die Kopien hier manuell nachgezogen werden (einfach die
// vier Dateien erneut hierher kopieren). Sie sind inhaltlich identisch zu
// den Originalen in ../../src/.

#include <Arduino.h>
#include "cooling_control.h"
#include "schedule.h"

namespace {
int testsRun = 0;
int testsFailed = 0;

void check(bool condition, const char* description) {
    testsRun++;
    if (!condition) {
        testsFailed++;
        Serial.print("FEHLER: ");
        Serial.println(description);
    } else {
        Serial.print("ok:     ");
        Serial.println(description);
    }
}

bool nearlyEqual(float a, float b, float eps = 0.01f) {
    float d = a - b;
    if (d < 0) d = -d;
    return d < eps;
}

void testHysteresisBasics() {
    Serial.println("--- Hysterese: Grundfunktion ---");
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.manualOverrideActive = false;

    // Unter der oberen Schwelle, Relais aus -> bleibt aus.
    in.currentTempC = 4.3f; // < 4.0 + 0.5
    in.relayCurrentlyOn = false;
    in.secondsSinceLastOff = 10000; // Mindestzeit laengst abgelaufen
    auto d1 = evaluateCoolingRelay(in);
    check(d1.relayShouldBeOn == false, "Unter oberer Schwelle: Relais bleibt aus");

    // Genau an der oberen Schwelle -> schaltet ein.
    in.currentTempC = 4.5f; // == 4.0 + 0.5
    auto d2 = evaluateCoolingRelay(in);
    check(d2.relayShouldBeOn == true, "An der oberen Schwelle: Relais schaltet ein");

    // Relais ist an, Temperatur noch ueber der unteren Schwelle -> bleibt an.
    in.relayCurrentlyOn = true;
    in.currentTempC = 3.9f; // > 4.0 - 0.2
    auto d3 = evaluateCoolingRelay(in);
    check(d3.relayShouldBeOn == true, "Relais an, ueber unterer Schwelle: bleibt an");

    // Genau an der unteren Schwelle -> schaltet aus.
    in.currentTempC = 3.8f; // == 4.0 - 0.2
    auto d4 = evaluateCoolingRelay(in);
    check(d4.relayShouldBeOn == false, "An der unteren Schwelle: Relais schaltet aus");
}

void testMinOffGuard() {
    Serial.println("--- Hysterese: Kompressorschutz (Mindest-Ausschaltzeit) ---");
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.manualOverrideActive = false;
    in.relayCurrentlyOn = false;
    in.currentTempC = 10.0f; // weit ueber der Schwelle - wuerde sonst sofort einschalten

    in.secondsSinceLastOff = 0;
    auto d1 = evaluateCoolingRelay(in);
    check(d1.relayShouldBeOn == false, "Weit ueber Schwelle, aber Mindestzeit=0s: bleibt aus");
    check(d1.blockedByMinOffGuard == true, "...und wird als 'durch Schutz blockiert' markiert");
    check(d1.guardSecondsRemaining == 240, "...mit 240s Restzeit");

    in.secondsSinceLastOff = 239;
    auto d2 = evaluateCoolingRelay(in);
    check(d2.relayShouldBeOn == false, "239s von 240s: bleibt noch aus");

    in.secondsSinceLastOff = 240;
    auto d3 = evaluateCoolingRelay(in);
    check(d3.relayShouldBeOn == true, "Genau 240s erreicht: schaltet jetzt ein");
    check(d3.blockedByMinOffGuard == false, "...Schutz nicht mehr aktiv");
}

void testManualOverride() {
    Serial.println("--- Hysterese: Manueller Modus ---");
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.manualOverrideActive = true;
    in.currentTempC = -5.0f; // weit UNTER der Schwelle - automatisch wuerde das nie einschalten

    // Manuelles AUS wirkt immer sofort, auch wenn Kompressorschutz-Zeit noch nicht um ist.
    in.relayCurrentlyOn = true;
    in.manualRequestOn = false;
    in.secondsSinceLastOff = 0;
    auto d1 = evaluateCoolingRelay(in);
    check(d1.relayShouldBeOn == false, "Manuell AUS wirkt sofort, auch mitten im Betrieb");

    // Manuelles AN ignoriert die Temperaturschwelle, respektiert aber den Kompressorschutz.
    in.relayCurrentlyOn = false;
    in.manualRequestOn = true;
    in.secondsSinceLastOff = 0;
    auto d2 = evaluateCoolingRelay(in);
    check(d2.relayShouldBeOn == false, "Manuell AN wird durch Mindestzeit blockiert (0s von 240s)");
    check(d2.blockedByMinOffGuard == true, "...als blockiert markiert, nicht stillschweigend ignoriert");

    in.secondsSinceLastOff = 240;
    auto d3 = evaluateCoolingRelay(in);
    check(d3.relayShouldBeOn == true, "Manuell AN schaltet nach Ablauf der Mindestzeit ein (trotz -5C)");
}

void testScheduleAdvance() {
    Serial.println("--- Gaerplan: Fortschritt ---");
    Schedule sched{};
    sched.stepCount = 2;
    strncpy(sched.steps[0].name, "Primaer", sizeof(sched.steps[0].name));
    sched.steps[0].targetTempC = 18.0f;
    sched.steps[0].durationSeconds = 100;
    sched.steps[0].rampToNext = false;
    strncpy(sched.steps[1].name, "Kaltlagerung", sizeof(sched.steps[1].name));
    sched.steps[1].targetTempC = 2.0f;
    sched.steps[1].durationSeconds = 200;
    sched.steps[1].rampToNext = false;

    ScheduleProgress p{};
    p.state = ScheduleState::RUNNING;
    p.currentStepIndex = 0;
    p.stepElapsedSeconds = 0;

    p = advanceSchedule(sched, p, 50);
    check(p.currentStepIndex == 0, "Nach 50s von 100s: noch in Schritt 0");
    check(p.stepElapsedSeconds == 50, "...mit 50s verstrichen");

    p = advanceSchedule(sched, p, 60); // 50+60=110 > 100 -> wechselt zu Schritt 1 mit 10s Rest
    check(p.currentStepIndex == 1, "Nach weiteren 60s (110s gesamt): in Schritt 1 gewechselt");
    check(p.stepElapsedSeconds == 10, "...mit 10s Ueberhang in Schritt 1");
    check(p.state == ScheduleState::RUNNING, "...Status weiterhin RUNNING");

    p = advanceSchedule(sched, p, 500); // weit ueber die restlichen 190s von Schritt 1 hinaus
    check(p.state == ScheduleState::FINISHED, "Nach Ueberschreiten des letzten Schritts: FINISHED");
    check(p.currentStepIndex == 1, "...bleibt auf dem letzten Schritt stehen (fuer die Zieltemperatur)");
    check(p.stepElapsedSeconds == 200, "...stepElapsedSeconds auf die volle Schrittdauer geklemmt");

    // Im Zustand IDLE/FINISHED/MANUAL darf advanceSchedule nichts veraendern.
    ScheduleProgress idle{};
    idle.state = ScheduleState::IDLE;
    idle.currentStepIndex = -1;
    idle.stepElapsedSeconds = 0;
    ScheduleProgress idleAfter = advanceSchedule(sched, idle, 9999);
    check(idleAfter.state == ScheduleState::IDLE, "IDLE bleibt IDLE, auch nach viel Zeit");
    check(idleAfter.currentStepIndex == -1, "...currentStepIndex bleibt -1");
}

void testRampInterpolation() {
    Serial.println("--- Gaerplan: Rampen-Interpolation ---");
    ScheduleStep step{};
    step.targetTempC = 18.0f;
    step.durationSeconds = 1000;
    step.rampToNext = true;
    ScheduleStep next{};
    next.targetTempC = 2.0f;

    float at0 = effectiveTargetTempC(step, true, next, 0);
    check(nearlyEqual(at0, 18.0f), "Rampe bei 0% Fortschritt: Starttemperatur");

    float at50 = effectiveTargetTempC(step, true, next, 500);
    check(nearlyEqual(at50, 10.0f), "Rampe bei 50% Fortschritt: Mittelwert (18 -> 2 = 10)");

    float at100 = effectiveTargetTempC(step, true, next, 1000);
    check(nearlyEqual(at100, 2.0f), "Rampe bei 100% Fortschritt: Zieltemperatur erreicht");

    // Ohne rampToNext bleibt es bei der festen Zieltemperatur, egal wie viel Zeit vergangen ist.
    ScheduleStep noRamp{};
    noRamp.targetTempC = 18.0f;
    noRamp.durationSeconds = 1000;
    noRamp.rampToNext = false;
    float fixedAt500 = effectiveTargetTempC(noRamp, true, next, 500);
    check(nearlyEqual(fixedAt500, 18.0f), "Ohne Rampe: Zieltemperatur bleibt konstant");
}

} // namespace

void setup() {
    Serial.begin(115200);
    delay(1500);
    Serial.println();
    Serial.println("=== Selbsttest: cooling_control.cpp + schedule.cpp ===");

    testHysteresisBasics();
    testMinOffGuard();
    testManualOverride();
    testScheduleAdvance();
    testRampInterpolation();

    Serial.println();
    Serial.print(testsRun);
    Serial.print(" Tests gelaufen, ");
    Serial.print(testsFailed);
    Serial.println(" fehlgeschlagen.");
    if (testsFailed == 0) {
        Serial.println(">>> ALLE TESTS BESTANDEN <<<");
    } else {
        Serial.println(">>> ES GIBT FEHLGESCHLAGENE TESTS - bitte cooling_control.cpp/schedule.cpp pruefen! <<<");
    }
}

void loop() {
    // Nichts zu tun - das Ergebnis steht im seriellen Monitor.
    delay(10000);
}
