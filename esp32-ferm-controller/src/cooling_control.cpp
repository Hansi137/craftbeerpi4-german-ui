#include "cooling_control.h"

namespace {

// Darf das Relais JETZT eingeschaltet werden (Kompressorschutz)?
// Diese Prüfung ist absichtlich die einzige Stelle, die über ein "Einschalten
// erlaubt" entscheidet - sowohl der automatische als auch der manuelle Pfad
// rufen sie auf, damit es keinen zweiten Codepfad gibt, der sie umgeht.
bool minOffGuardSatisfied(const CoolingInputs& in) {
    return in.secondsSinceLastOff >= in.minCompressorOffSeconds;
}

uint32_t guardRemaining(const CoolingInputs& in) {
    if (in.secondsSinceLastOff >= in.minCompressorOffSeconds) return 0;
    return in.minCompressorOffSeconds - in.secondsSinceLastOff;
}

} // namespace

CoolingDecision evaluateCoolingRelay(const CoolingInputs& in) {
    CoolingDecision out{};
    out.relayShouldBeOn = in.relayCurrentlyOn;
    out.blockedByMinOffGuard = false;
    out.guardSecondsRemaining = 0;

    if (in.manualOverrideActive) {
        if (!in.manualRequestOn) {
            // Manuelles AUS wirkt immer sofort - ein Kühlschrank ausschalten
            // ist nie unsicher.
            out.relayShouldBeOn = false;
            return out;
        }
        // Manuelles AN: Temperaturschwelle wird ignoriert (das ist der Sinn
        // des manuellen Modus), die Mindest-Ausschaltzeit aber NICHT.
        if (in.relayCurrentlyOn) {
            out.relayShouldBeOn = true;
            return out;
        }
        if (minOffGuardSatisfied(in)) {
            out.relayShouldBeOn = true;
        } else {
            out.relayShouldBeOn = false;
            out.blockedByMinOffGuard = true;
            out.guardSecondsRemaining = guardRemaining(in);
        }
        return out;
    }

    // Automatischer Modus (Gärplan-gesteuerte Hysterese)
    if (in.relayCurrentlyOn) {
        // EIN -> AUS, sobald die untere Schwelle erreicht ist.
        if (in.currentTempC <= in.targetTempC - in.offOffsetC) {
            out.relayShouldBeOn = false;
        } else {
            out.relayShouldBeOn = true;
        }
        return out;
    }

    // AUS -> EIN nur, wenn Temperatur über der oberen Schwelle liegt UND
    // die Mindest-Ausschaltzeit abgelaufen ist.
    bool temperatureWantsOn = in.currentTempC >= in.targetTempC + in.onOffsetC;
    if (!temperatureWantsOn) {
        out.relayShouldBeOn = false;
        return out;
    }
    if (minOffGuardSatisfied(in)) {
        out.relayShouldBeOn = true;
    } else {
        out.relayShouldBeOn = false;
        out.blockedByMinOffGuard = true;
        out.guardSecondsRemaining = guardRemaining(in);
    }
    return out;
}
