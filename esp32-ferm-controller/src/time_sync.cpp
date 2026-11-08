#include "time_sync.h"
#include "config.h"

#include <time.h>

namespace {
// Alles vor diesem Zeitpunkt (ca. 2023-11-14) ist mit Sicherheit kein
// echter, per NTP gesetzter Wert, sondern der ESP32-Rohzustand (Zeit laeuft
// ab dem 1.1.1970).
const time_t PLAUSIBLE_MIN_EPOCH = 1700000000;
} // namespace

namespace time_sync {

void begin() {
    configTzTime(TIME_ZONE_POSIX, NTP_SERVER);
}

bool isSynced() {
    return time(nullptr) > PLAUSIBLE_MIN_EPOCH;
}

String isoTimestamp() {
    if (!isSynced()) return String("");
    time_t now = time(nullptr);
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);
    char buf[25];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    return String(buf);
}

} // namespace time_sync
