<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
  http_response_code(422);
  echo json_encode(["error" => "Faltan credenciales"]);
  exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash, rol, nombre, apellidos, api_token FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
  http_response_code(401);
  echo json_encode(["error" => "Credenciales incorrectas"]);
  exit;
}

// Si la contraseña almacenada fue con SHA2 en tus seeds antiguas, puedes migrar:
//  - probar password_verify(); si falla, probar hash SHA2 comparando hash.
// Para simplicidad asumimos password_hash() para nuevas cuentas.
if (!password_verify($password, $user['password_hash'])) {
  http_response_code(401);
  echo json_encode(["error" => "Credenciales incorrectas"]);
  exit;
}

// Si no tiene token, genera uno
if (empty($user['api_token'])) {
  $token = bin2hex(random_bytes(32));
  $stmt = $pdo->prepare("UPDATE usuarios SET api_token = ? WHERE id = ?");
  $stmt->execute([$token, $user['id']]);
} else {
  $token = $user['api_token'];
}

echo json_encode([
  "message" => "Login ok",
  "user" => ["id" => $user['id'], "email" => $email, "rol" => $user['rol'], "nombre" => $user['nombre'], "apellidos" => $user['apellidos']],
  "api_token" => $token
]);
