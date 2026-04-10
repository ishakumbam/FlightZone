#!/bin/bash
# ============================================================
# FlightZone AI — Performance Test Script
# Task 3.18 — tests/performance_test.sh
#
# Usage:
#   chmod +x tests/performance_test.sh
#   ./tests/performance_test.sh
#
# Requires:
#   - Server running at http://localhost:5000
#   - JWT_TOKEN exported or set below
# ============================================================

set -e

BASE_URL="${1:-http://localhost:5000}"
FLIGHT_ID="${2:-AA100}"
TOKEN="${JWT_TOKEN:-}"

# ── Get a token if not provided ───────────────────────────
if [ -z "$TOKEN" ]; then
  echo "[INFO] No JWT_TOKEN set. Attempting login to get one..."
  TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"employeeId":"EMP001","password":"Admin@1234"}' | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

  if [ -z "$TOKEN" ]; then
    echo "[ERROR] Could not obtain JWT token. Make sure the server is running and DB is seeded."
    exit 1
  fi
  echo "[INFO] Token obtained ✓"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  FlightZone AI — POST /api/optimize"
echo "  Flight: $FLIGHT_ID  |  Runs: 5"
echo "  Target: < 6000ms average"
echo "═══════════════════════════════════════"
echo ""

TOTAL=0
LOG_FILE="performance_log.txt"
echo "Performance Test — $(date)" > "$LOG_FILE"
echo "Flight: $FLIGHT_ID | Target: < 6000ms" >> "$LOG_FILE"
echo "────────────────────────────────────────" >> "$LOG_FILE"

PASS=0
FAIL=0

for i in 1 2 3 4 5; do
  START=$(python3 -c "import time; print(int(time.time() * 1000))")

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/optimize" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"flightId\":\"$FLIGHT_ID\",\"timeframe\":\"Today\"}")

  END=$(python3 -c "import time; print(int(time.time() * 1000))")
  ELAPSED=$((END - START))
  TOTAL=$((TOTAL + ELAPSED))

  STATUS="PASS"
  if [ "$ELAPSED" -gt 6000 ] || [ "$HTTP_STATUS" != "200" ]; then
    STATUS="FAIL"
    FAIL=$((FAIL + 1))
  else
    PASS=$((PASS + 1))
  fi

  echo "  Run $i: ${ELAPSED}ms  HTTP $HTTP_STATUS  [$STATUS]"
  echo "Run $i: ${ELAPSED}ms  HTTP $HTTP_STATUS  [$STATUS]" >> "$LOG_FILE"
done

AVG=$((TOTAL / 5))
echo ""
echo "════════════════════════════════"
echo "  Average: ${AVG}ms"
echo "  Pass: $PASS / 5 | Fail: $FAIL / 5"

if [ "$AVG" -le 6000 ]; then
  echo "  ✅ NF5 SATISFIED (< 6 seconds)"
  echo "" >> "$LOG_FILE"
  echo "Average: ${AVG}ms  — PASS (NF5 satisfied)" >> "$LOG_FILE"
else
  echo "  ❌ NF5 FAILED — average exceeds 6 seconds"
  echo "" >> "$LOG_FILE"
  echo "Average: ${AVG}ms  — FAIL" >> "$LOG_FILE"
fi

echo "════════════════════════════════"
echo ""
echo "[INFO] Results saved to $LOG_FILE"
