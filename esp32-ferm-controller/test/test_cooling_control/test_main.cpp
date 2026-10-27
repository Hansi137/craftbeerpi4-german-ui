// Host-seitiger Unity-Test für cooling_control.cpp - braucht KEINE
// ESP32-Hardware. Ausführen mit: pio test -e native
//
// Bindet die echte Quelldatei aus src/ direkt ein (reine Logik ohne
// Arduino-Abhängigkeiten, daher problemlos nativ kompilierbar) - kein
// Duplikat zu pflegen, anders als der eigenständige ESP32-Selbsttest unter
// test/selftest/ (dort ist ein direkter Verweis aus sketch-technischen
// Gründen nicht zuverlässig möglich, siehe Kommentar dort).

#include <unity.h>
#include "../../src/cooling_control.h"
#include "../../src/cooling_control.cpp"

void setUp(void) {}
void tearDown(void) {}

void test_stays_off_below_upper_threshold(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.relayCurrentlyOn = false;
    in.secondsSinceLastOff = 10000;
    in.currentTempC = 4.3f; // < target + onOffset
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_FALSE(d.relayShouldBeOn);
}

void test_turns_on_at_upper_threshold(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.relayCurrentlyOn = false;
    in.secondsSinceLastOff = 10000;
    in.currentTempC = 4.5f; // == target + onOffset
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_TRUE(d.relayShouldBeOn);
}

void test_stays_on_above_lower_threshold(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.relayCurrentlyOn = true;
    in.currentTempC = 3.9f; // > target - offOffset
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_TRUE(d.relayShouldBeOn);
}

void test_turns_off_at_lower_threshold(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.relayCurrentlyOn = true;
    in.currentTempC = 3.8f; // == target - offOffset
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_FALSE(d.relayShouldBeOn);
}

void test_min_off_guard_blocks_turning_on(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.relayCurrentlyOn = false;
    in.currentTempC = 10.0f; // weit ueber der Schwelle
    in.secondsSinceLastOff = 0;
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_FALSE(d.relayShouldBeOn);
    TEST_ASSERT_TRUE(d.blockedByMinOffGuard);
    TEST_ASSERT_EQUAL_UINT32(240, d.guardSecondsRemaining);
}

void test_min_off_guard_releases_exactly_at_boundary(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.onOffsetC = 0.5f;
    in.offOffsetC = 0.2f;
    in.minCompressorOffSeconds = 240;
    in.relayCurrentlyOn = false;
    in.currentTempC = 10.0f;

    in.secondsSinceLastOff = 239;
    TEST_ASSERT_FALSE(evaluateCoolingRelay(in).relayShouldBeOn);

    in.secondsSinceLastOff = 240;
    TEST_ASSERT_TRUE(evaluateCoolingRelay(in).relayShouldBeOn);
}

void test_manual_off_always_wins_immediately(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.manualOverrideActive = true;
    in.manualRequestOn = false;
    in.relayCurrentlyOn = true;
    in.secondsSinceLastOff = 0; // Schutz-Timer irrelevant fuer AUS
    CoolingDecision d = evaluateCoolingRelay(in);
    TEST_ASSERT_FALSE(d.relayShouldBeOn);
}

void test_manual_on_still_respects_min_off_guard(void) {
    CoolingInputs in{};
    in.targetTempC = 4.0f;
    in.manualOverrideActive = true;
    in.manualRequestOn = true;
    in.relayCurrentlyOn = false;
    in.minCompressorOffSeconds = 240;
    in.currentTempC = -5.0f; // automatisch würde das NIE einschalten wollen

    in.secondsSinceLastOff = 0;
    CoolingDecision d1 = evaluateCoolingRelay(in);
    TEST_ASSERT_FALSE(d1.relayShouldBeOn);
    TEST_ASSERT_TRUE(d1.blockedByMinOffGuard);

    in.secondsSinceLastOff = 240;
    CoolingDecision d2 = evaluateCoolingRelay(in);
    TEST_ASSERT_TRUE(d2.relayShouldBeOn); // Temperaturschwelle wird im manuellen Modus ignoriert
}

int main(int argc, char** argv) {
    UNITY_BEGIN();
    RUN_TEST(test_stays_off_below_upper_threshold);
    RUN_TEST(test_turns_on_at_upper_threshold);
    RUN_TEST(test_stays_on_above_lower_threshold);
    RUN_TEST(test_turns_off_at_lower_threshold);
    RUN_TEST(test_min_off_guard_blocks_turning_on);
    RUN_TEST(test_min_off_guard_releases_exactly_at_boundary);
    RUN_TEST(test_manual_off_always_wins_immediately);
    RUN_TEST(test_manual_on_still_respects_min_off_guard);
    return UNITY_END();
}
