<?php
// servicios_debug.php -- TEMPORAL para depuración. BORRAR después de usar.
header("Content-Type: application/json; charset=UTF-8");

// CORS mínimo para que puedas llamar desde el navegador
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if ($origin) header("Access-Control-Allow-Origin: $origin"); else header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// helpers
function fetch_all_headers_normalized() {
    $h = [];
    if (function_exists('getallheaders')) {
        $raw = getallheaders();
        foreach($raw as $k => $v) $h[$k] = $v;
    } elseif (function_exists('apache_request_headers')) {
        $raw = apache_request_headers();
        foreach($raw as $k => $v) $h[$k] = $v;
    } else {
        // fallback: scan $_SERVER for HTTP_*
        foreach($_SERVER as $k => $v) {
            if (strpos($k, 'HTTP_') === 0) {
                $name = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($k,5)))));
                $h[$name] = $v;
            }
        }
    }
    return $h;
}

function getBearerToken() {
    // try common sources
    $headersLower = array_change_key_case(fetch_all_headers_normalized(), CASE_LOWER);
    if (!empty($headersLower['authorization'])) {
        $auth = $headersLower['authorization'];
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['AUTHORIZATION'])) {
        $auth = $_SERVER['AUTHORIZATION'];
    } else {
        $auth = null;
    }
    if (!$auth) return null;
    if (preg_match('/Bearer\s+(.+)$/i', trim($auth), $m)) return $m[1];
    return null;
}

// leer body JSON si hay
$body = file_get_contents('php://input');
$bodyObj = json_decode($body);

// tokens desde distintos lugares (prioridad: header, GET token, body.token)
$token_header = getBearerToken();
$token_get = $_GET['token'] ?? null;
$token_body = $bodyObj->token ?? null;

// conexión DB (usa tu modelos.php para no duplicar configuración)
require_once 'modelos.php';
$modelo = new Modelo();

// Normalizar: trim tokens
$th = $token_header ? trim($token_header) : null;
$tg = $token_get ? trim($token_get) : null;
$tb = $token_body ? trim($token_body) : null;

// intentar buscar usuario por token (prueba header primero, luego GET, luego body)
$found = null; $which = null; $dbErr = null;
$tryTokens = [];
if ($th) $tryTokens[] = ['t'=>$th,'from'=>'header'];
if ($tg) $tryTokens[] = ['t'=>$tg,'from'=>'get'];
if ($tb) $tryTokens[] = ['t'=>$tb,'from'=>'body'];

foreach ($tryTokens as $tt) {
    try {
        // usamos TRIM en la comparación para evitar espacios invisibles
        $stm = $modelo->pdo->prepare("SELECT id, email, rol, nombre, apellidos, api_token, LENGTH(api_token) AS tok_len FROM usuarios WHERE TRIM(api_token) = TRIM(?) LIMIT 1");
        $stm->execute(array($tt['t']));
        $user = $stm->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $found = $user;
            $which = $tt['from'];
            break;
        }
    } catch (Exception $e) {
        $dbErr = $e->getMessage();
        error_log("servicios_debug.php DB error: " . $e->getMessage());
    }
}

// Build response
$response = [
    "ok" => true,
    "note" => "Este endpoint es solo para depuración. Borra el archivo después de usar.",
    "received" => [
        "method" => $_SERVER['REQUEST_METHOD'],
        "headers" => fetch_all_headers_normalized(),
        "server_vars" => [
            "HTTP_AUTHORIZATION" => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
            "REDIRECT_HTTP_AUTHORIZATION" => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
            "AUTHORIZATION" => $_SERVER['AUTHORIZATION'] ?? null,
            "REQUEST_URI" => $_SERVER['REQUEST_URI'] ?? null,
            "REMOTE_ADDR" => $_SERVER['REMOTE_ADDR'] ?? null,
            "HTTP_ORIGIN" => $_SERVER['HTTP_ORIGIN'] ?? null
        ],
        "body_raw" => $body,
        "body_parsed" => $bodyObj,
        "token_header" => $th,
        "token_get" => $tg,
        "token_body" => $tb
    ],
    "db_lookup" => [
        "attempts" => count($tryTokens),
        "found" => $found ? true : false,
        "found_from" => $which,
        "user" => $found ? $found : null,
        "db_error" => $dbErr
    ]
];

// also log short info in error_log for server-side trace
error_log("servicios_debug: token_header=" . ($th ?? 'NULL') . " token_get=" . ($tg ?? 'NULL') . " token_body=" . ($tb ?? 'NULL') . " found=" . ($found ? 'YES' : 'NO'));

echo json_encode($response, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
exit;
