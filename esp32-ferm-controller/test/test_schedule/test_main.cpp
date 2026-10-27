// Host-seitiger Unity-Test für schedule.cpp - braucht KEINE ESP32-Hardware.
// Ausführen mit: pio test -e native

#include <unity.h>
#include <cstring>
#include "../../src/schedule.h"
#include "../../src/schedule.cpp"

void setUp(void) {}
void tearDown(void) {}

namespace {
Schedule makeTwoStepSchedule() {
    Schedule s{};
    s.stepCount = 2;
    strncpy(s.steps[0].name, "Primaer", sizeof(s.steps[0].name));
    s.steps[0].targetTempC = 18.0f;
    s.steps[0].durationSeconds = 100;
    s.steps[0].rampToNext = false;
    strncpy(s.steps[1].name, "Kaltlagerung", sizeof(s.steps[1].name));
    s.steps[1].targetTempC = 2.0f;
    s.steps[1].durationSeconds = 200;
    s.steps[1].rampToNext = false;
    return s;
}
}

void test_stays_in_same_step_before_duration_elapsed(void) {
    Schedule s = makeTwoStepSchedule();
    ScheduleProgress p{};
    p.state = ScheduleState::RUNNING;
    p.currentStepIndex = 0;
    p.stepElapsedSeconds = 0;

    p = advanceSchedule(s, p, 50);
    TEST_ASSERT_EQUAL_INT(0, p.currentStepIndex);
    TEST_ASSERT_EQUAL_UINT32(50, p.stepElapsedSeconds);
    TEST_ASSERT_TRUE(p.state == ScheduleState::RUNNING);
}

void test_advances_to_next_step_with_overflow_carried(void) {
    Schedule s = makeTwoStepSchedule();
    ScheduleProgress p{};
    p.state = ScheduleState::RUNNING;
    p.currentStepIndex = 0;
    p.stepElapsedSeconds = 50;

    p = advanceSchedule(s, p, 60); // 50+60=110 > 100 -> Schritt 1, 10s Ueberhang
    TEST_ASSERT_EQUAL_INT(1, p.currentStepIndex);
    TEST_ASSERT_EQUAL_UINT32(10, p.stepElapsedSeconds);
    TEST_ASSERT_TRUE(p.state == ScheduleState::RUNNING);
}

void test_finishes_after_last_step_and_holds_it(void) {
    Schedule s = makeTwoStepSchedule();
    ScheduleProgress p{};
    p.state = ScheduleState::RUNNING;
    p.currentStepIndex = 1;
    p.stepElapsedSeconds = 10;

    p = advanceSchedule(s, p, 500); // weit ueber die restlichen 190s hinaus
    TEST_ASSERT_TRUE(p.state == ScheduleState::FINISHED);
    TEST_ASSERT_EQUAL_INT(1, p.currentStepIndex); // bleibt auf letztem Schritt stehen
    TEST_ASSERT_EQUAL_UINT32(200, p.stepElapsedSeconds); // auf Schrittdauer geklemmt
}

void test_non_running_states_are_not_advanced(void) {
    Schedule s = makeTwoStepSchedule();
    ScheduleProgress idle{};
    idle.state = ScheduleState::IDLE;
    idle.currentStepIndex = -1;
    idle.stepElapsedSeconds = 0;

    ScheduleProgress after = advanceSchedule(s, idle, 99999);
    TEST_ASSERT_TRUE(after.state == ScheduleState::IDLE);
    TEST_ASSERT_EQUAL_INT(-1, after.currentStepIndex);
}

void test_empty_schedule_forces_idle(void) {
    Schedule empty{};
    empty.stepCount = 0;
    ScheduleProgress p{};
    p.state = ScheduleState::RUNNING;
    p.currentStepIndex = 0;
    p.stepElapsedSeconds = 5;

    ScheduleProgress after = advanceSchedule(empty, p, 10);
    TEST_ASSERT_TRUE(after.state == ScheduleState::IDLE);
    TEST_ASSERT_EQUAL_INT(-1, after.currentStepIndex);
}

void test_ramp_interpolation_at_0_50_100_percent(void) {
    ScheduleStep step{};
    step.targetTempC = 18.0f;
    step.durationSeconds = 1000;
    step.rampToNext = true;
    ScheduleStep next{};
    next.targetTempC = 2.0f;

    TEST_ASSERT_FLOAT_WITHIN(0.01f, 18.0f, effectiveTargetTempC(step, true, next, 0));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 10.0f, effectiveTargetTempC(step, true, next, 500));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 2.0f, effectiveTargetTempC(step, true, next, 1000));
}

void test_no_ramp_stays_constant(void) {
    ScheduleStep step{};
    step.targetTempC = 18.0f;
    step.durationSeconds = 1000;
    step.rampToNext = false;
    ScheduleStep next{};
    next.targetTempC = 2.0f;

    TEST_ASSERT_FLOAT_WITHIN(0.01f, 18.0f, effectiveTargetTempC(step, true, next, 500));
}

void test_ramp_without_next_step_stays_constant(void) {
    ScheduleStep step{};
    step.targetTempC = 18.0f;
    step.durationSeconds = 1000;
    step.rampToNext = true; // gewünscht, aber es gibt keinen nächsten Schritt
    ScheduleStep dummy{};
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 18.0f, effectiveTargetTempC(step, /*hasNextStep=*/false, dummy, 500));
}

int main(int argc, char** argv) {
    UNITY_BEGIN();
    RUN_TEST(test_stays_in_same_step_before_duration_elapsed);
    RUN_TEST(test_advances_to_next_step_with_overflow_carried);
    RUN_TEST(test_finishes_after_last_step_and_holds_it);
    RUN_TEST(test_non_running_states_are_not_advanced);
    RUN_TEST(test_empty_schedule_forces_idle);
    RUN_TEST(test_ramp_interpolation_at_0_50_100_percent);
    RUN_TEST(test_no_ramp_stays_constant);
    RUN_TEST(test_ramp_without_next_step_stays_constant);
    return UNITY_END();
}
