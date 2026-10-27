#include "schedule.h"

float effectiveTargetTempC(const ScheduleStep& step, bool hasNextStep,
                            const ScheduleStep& nextStep, uint32_t elapsedSeconds) {
    if (!step.rampToNext || !hasNextStep || step.durationSeconds == 0) {
        return step.targetTempC;
    }
    float fraction = static_cast<float>(elapsedSeconds) / static_cast<float>(step.durationSeconds);
    if (fraction < 0.0f) fraction = 0.0f;
    if (fraction > 1.0f) fraction = 1.0f;
    return step.targetTempC + (nextStep.targetTempC - step.targetTempC) * fraction;
}

ScheduleProgress advanceSchedule(const Schedule& schedule, ScheduleProgress progress,
                                   uint32_t deltaSeconds) {
    // Kein Schritt vorhanden -> es gibt nichts zu tun, egal welcher Zustand
    // hereinkam (defensiv gegen leere/korrupte Pläne).
    if (schedule.stepCount <= 0) {
        progress.state = ScheduleState::IDLE;
        progress.currentStepIndex = -1;
        progress.stepElapsedSeconds = 0;
        return progress;
    }

    // Nur im laufenden Zustand zählt die Zeit überhaupt weiter.
    if (progress.state != ScheduleState::RUNNING) {
        return progress;
    }

    if (progress.currentStepIndex < 0 || progress.currentStepIndex >= schedule.stepCount) {
        progress.currentStepIndex = 0;
        progress.stepElapsedSeconds = 0;
    }

    progress.stepElapsedSeconds += deltaSeconds;

    // Über ggf. mehrere abgelaufene Schritte hinweg vorrücken (z.B. nach
    // einem langen Stromausfall, bei dem mehrere Schritte "verstrichen"
    // wären, falls das Gerät eine Weile ausgeschaltet war - in der Praxis
    // wird hier meist nur ein einzelner Schritt-Übergang passieren).
    while (progress.currentStepIndex < schedule.stepCount) {
        uint32_t stepDuration = schedule.steps[progress.currentStepIndex].durationSeconds;
        if (progress.stepElapsedSeconds < stepDuration) {
            // Noch im aktuellen Schritt.
            return progress;
        }
        progress.stepElapsedSeconds -= stepDuration;
        progress.currentStepIndex += 1;
    }

    // Letzten Schritt abgeschlossen -> Plan fertig, letzte Zieltemperatur
    // wird weiter gehalten (siehe FINISHED-Verhalten in cooling_control).
    progress.currentStepIndex = schedule.stepCount - 1;
    progress.stepElapsedSeconds = schedule.steps[progress.currentStepIndex].durationSeconds;
    progress.state = ScheduleState::FINISHED;
    return progress;
}
