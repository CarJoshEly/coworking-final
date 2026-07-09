#!/bin/bash
# Pruebas de endpoints nuevos (reviews, favorites, notifications) via curl.
# Uso: correr el proyecto (npm run start:dev) y luego ejecutar este script
# por bloques (copia/pega cada sección en Git Bash) o completo con:
#   bash test-endpoints.sh
#
# Ajusta EMAIL/PASSWORD por un usuario que ya exista en tu base (creado
# con POST /users), SPACE_ID por un espacio existente (GET /spaces) y
# API_URL por la URL base de la API.

set -e
: "${API_URL:?Debes definir API_URL con la URL base de la API}"
API="$API_URL"
EMAIL="usuario@test.com"
PASSWORD="123456"
SPACE_ID=1

echo "== 1. Login =="
LOGIN_RES=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RES"
TOKEN=$(echo "$LOGIN_RES" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
if [ -z "$TOKEN" ]; then
  echo "!! No se obtuvo token, revisa EMAIL/PASSWORD arriba."
  exit 1
fi
echo "TOKEN obtenido: ${TOKEN:0:20}..."
AUTH="Authorization: Bearer $TOKEN"

echo
echo "== 2. REVIEWS =="

echo "-- 2.1 Crear review (rating valido) --"
curl -s -X POST "$API/spaces/$SPACE_ID/reviews" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"rating":5,"comment":"Excelente espacio, muy tranquilo"}'
echo

echo "-- 2.2 Crear review DUPLICADA (debe dar 400) --"
curl -s -o /dev/null -w "status: %{http_code}\n" -X POST "$API/spaces/$SPACE_ID/reviews" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"rating":4,"comment":"otra reseña"}'

echo "-- 2.3 Rating invalido, fuera de rango (debe dar 400 de validacion) --"
curl -s -o /dev/null -w "status: %{http_code}\n" -X POST "$API/spaces/999/reviews" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"rating":8,"comment":"invalido"}'

echo "-- 2.4 Listar reviews del espacio --"
curl -s "$API/spaces/$SPACE_ID/reviews" -H "$AUTH"
echo

echo
echo "== 3. FAVORITES =="

echo "-- 3.1 Agregar favorito --"
curl -s -X POST "$API/favorites" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"spaceId\":$SPACE_ID}"
echo

echo "-- 3.2 Agregar el MISMO favorito otra vez (debe dar 400) --"
curl -s -o /dev/null -w "status: %{http_code}\n" -X POST "$API/favorites" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"spaceId\":$SPACE_ID}"

echo "-- 3.3 Listar mis favoritos --"
curl -s "$API/favorites" -H "$AUTH"
echo

echo "-- 3.4 Quitar favorito --"
curl -s -o /dev/null -w "status: %{http_code}\n" -X DELETE "$API/favorites/$SPACE_ID" -H "$AUTH"

echo "-- 3.5 Quitar el mismo favorito otra vez (debe dar 404) --"
curl -s -o /dev/null -w "status: %{http_code}\n" -X DELETE "$API/favorites/$SPACE_ID" -H "$AUTH"

echo
echo "== 4. NOTIFICATIONS (requiere una reserva existente en tu usuario) =="
echo "   Reemplaza RESERVATION_ID abajo por el id de una reserva tuya"
echo "   (GET $API/reservations/me con tu token para verla)."
echo "-- 4.1 Confirmar reserva -> debe generar notificacion automatica --"
echo '   curl -s -X PATCH '"$API"'/reservations/RESERVATION_ID/status \'
echo '     -H "Content-Type: application/json" -H "'"$AUTH"'" \'
echo '     -d '"'"'{"status":"CONFIRMED"}'"'"

echo "-- 4.2 Listar mis notificaciones --"
curl -s "$API/notifications" -H "$AUTH"
echo

echo "-- 4.3 Marcar todas como leidas --"
curl -s -X PATCH "$API/notifications/read-all" -H "$AUTH"
echo
