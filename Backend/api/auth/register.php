<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // para desarrollo; en producción restringir

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
  http_response_code(400);
  echo json_encode(["error" => "JSON inválido"]);
  exit;
}

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$rol = ($data['rol'] ?? 'consumidor');
$nombre = $data['nombre'] ?? '';
$apellidos = $data['apellidos'] ?? '';

if (!$email || !$password || !$nombre) {
  http_response_code(422);
  echo json_encode(["error" => "Faltan campos obligatorios"]);
  exit;
}

// comprobar email único
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  http_response_code(409);
  echo json_encode(["error" => "Email ya registrado"]);
  exit;
}

// almacenar
$hash = password_hash($password, PASSWORD_DEFAULT);
$token = bin2hex(random_bytes(32)); // 64 chars hex

$stmt = $pdo->prepare("INSERT INTO usuarios (email, password_hash, rol, nombre, apellidos, api_token) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$email, $hash, $rol, $nombre, $apellidos, $token]);

$userId = $pdo->lastInsertId();

echo json_encode([
  "message" => "Usuario creado",
  "user" => ["id" => $userId, "email" => $email, "rol" => $rol, "nombre" => $nombre],
  "api_token" => $token
]);
