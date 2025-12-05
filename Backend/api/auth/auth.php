<?php
// devuelve $currentUser o null
function getAuthUser($pdo) {
  $headers = getallheaders();
  $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
  if (!$auth) return null;
  if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
    $token = $matches[1];
  } else {
    return null;
  }
  $stmt = $pdo->prepare("SELECT id, email, rol, nombre, apellidos FROM usuarios WHERE api_token = ?");
  $stmt->execute([$token]);
  return $stmt->fetch();
}
