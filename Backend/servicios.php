<?php
// servicios.php
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es preflight OPTIONS responder OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'modelos.php';
$modelo = new Modelo();

// Recogemos datos JSON del body
$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

if ($objeto == null) {
    // Si no hay JSON, intentamos leer parámetros GET (por compatibilidad)
    if (!empty($_GET['accion'])) {
        $accion = $_GET['accion'];
    } else {
        echo json_encode(["error" => "No se recibió JSON ni parámetro accion"]);
        exit;
    }
} else {
    $accion = $objeto->accion ?? null;
}

// --- autenticación mínima: leer Authorization Bearer token si viene ---
function getBearerToken() {
    $headers = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } else {
        $headers = $_SERVER;
    }
    $authHeader = null;
    if (!empty($headers['Authorization'])) $authHeader = $headers['Authorization'];
    elseif (!empty($headers['authorization'])) $authHeader = $headers['authorization'];
    elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['HTTP_AUTHORIZATION'];

    if (!$authHeader) return null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}

$authUser = null;
$bearer = getBearerToken();
if ($bearer) {
    // buscar usuario por api_token
    try {
        $stm = $modelo->pdo->prepare("SELECT id, email, rol, nombre, apellidos FROM usuarios WHERE api_token = ? LIMIT 1");
        $stm->execute(array($bearer));
        $authUser = $stm->fetch(PDO::FETCH_OBJ) ?: null;
    } catch (Exception $e) {
        // error al consultar (no fatal), dejar authUser = null
        $authUser = null;
    }
}

if (!$accion) {
    echo json_encode(["error" => "Acción no especificada"]);
    exit;
}

switch ($accion) {

    // -------------------- USUARIOS --------------------
    case "ListarUsuarios":
        print json_encode($modelo->ListarUsuarios());
        break;

    case "ObtenerUsuarioId":
        print json_encode($modelo->ObtenerUsuarioId($objeto->id));
        break;

    case "AnadeUsuario":
        // Espera objeto usuario en $objeto->usuario
        if ($modelo->AnadeUsuario($objeto->usuario))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "ModificaUsuario":
        if ($modelo->ModificaUsuario($objeto->usuario))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "BorraUsuario":
        if ($modelo->BorraUsuario($objeto->id))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "LoginUsuario":
        // login: { accion:"LoginUsuario", email: "...", password: "..." }
        $res = $modelo->LoginUsuario($objeto->email ?? '', $objeto->password ?? '');
        print json_encode($res);
        break;


    // -------------------- OFERTAS --------------------
    case "ListarOfertas":
        print json_encode($modelo->ListarOfertas());
        break;

    case "ObtenerOfertaId":
        print json_encode($modelo->ObtenerOfertaId($objeto->id));
        break;

    case "AnadeOferta":
		// requiere auth y rol 'ofertante' (si no, FAIL)
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		if ($authUser->rol !== 'ofertante') { print '{"result":"FAIL","error":"No eres ofertante"}'; break; }

		// forzamos que el usuario creador sea el authUser->id (evitar spoofing)
		if (isset($objeto->oferta)) {
			$objeto->oferta->usuario_id = $authUser->id;
		}
		if ($modelo->AnadeOferta($objeto->oferta))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;


    case "ModificaOferta":
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		if (empty($objeto->oferta->id)) { print '{"result":"FAIL","error":"Falta id"}'; break; }
		// comprobar propiedad
		$of = $modelo->ObtenerOfertaId($objeto->oferta->id);
		if (!$of) { print '{"result":"FAIL","error":"Oferta no encontrada"}'; break; }
		if ($of->usuario_id != $authUser->id) { print '{"result":"FAIL","error":"No propietario"}'; break; }

		// No permitimos cambiar usuario_id: lo dejamos igual (por seguridad)
		$objeto->oferta->usuario_id = $authUser->id;
		if ($modelo->ModificaOferta($objeto->oferta))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;

    case "BorraOferta":
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		$id = $objeto->id ?? 0;
		$of = $modelo->ObtenerOfertaId($id);
		if (!$of) { print '{"result":"FAIL","error":"Oferta no encontrada"}'; break; }
		if ($of->usuario_id != $authUser->id) { print '{"result":"FAIL","error":"No propietario"}'; break; }
		if ($modelo->BorraOferta($id))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;


    // -------------------- PETICIONES --------------------
    case "ListarPeticiones":
        print json_encode($modelo->ListarPeticiones());
        break;

    case "ObtenerPeticionId":
        print json_encode($modelo->ObtenerPeticionId($objeto->id));
        break;

    case "AnadePeticion":
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		if ($authUser->rol !== 'consumidor') { print '{"result":"FAIL","error":"No eres consumidor"}'; break; }

		if (isset($objeto->peticion)) {
			$objeto->peticion->usuario_id = $authUser->id;
		}
		if ($modelo->AnadePeticion($objeto->peticion))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;

    case "ModificaPeticion":
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		if (empty($objeto->peticion->id)) { print '{"result":"FAIL","error":"Falta id"}'; break; }
		$p = $modelo->ObtenerPeticionId($objeto->peticion->id);
		if (!$p) { print '{"result":"FAIL","error":"Petición no encontrada"}'; break; }
		if ($p->usuario_id != $authUser->id) { print '{"result":"FAIL","error":"No propietario"}'; break; }
		$objeto->peticion->usuario_id = $authUser->id;
		if ($modelo->ModificaPeticion($objeto->peticion))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;

    case "BorraPeticion":
		if (!$authUser) { print '{"result":"FAIL","error":"No autenticado"}'; break; }
		$id = $objeto->id ?? 0;
		$p = $modelo->ObtenerPeticionId($id);
		if (!$p) { print '{"result":"FAIL","error":"Petición no encontrada"}'; break; }
		if ($p->usuario_id != $authUser->id) { print '{"result":"FAIL","error":"No propietario"}'; break; }
		if ($modelo->BorraPeticion($id))
			print '{"result":"OK"}';
		else
			print '{"result":"FAIL"}';
		break;


    // -------------------- ACCIONES COMPUESTAS / UTILIDADES --------------------
    case "ObtenerUsuarioConOfertas":
        // Devuelve usuario + sus ofertas
        $u = $modelo->ObtenerUsuarioId($objeto->id);
        if ($u) {
            $u->ofertas = $modelo->ListarOfertasUsuario($objeto->id);
        }
        print json_encode($u);
        break;

    case "ObtenerUsuarioConPeticiones":
        $u = $modelo->ObtenerUsuarioId($objeto->id);
        if ($u) {
            $u->peticiones = $modelo->ListarPeticionesUsuario($objeto->id);
        }
        print json_encode($u);
        break;

    default:
        echo json_encode(["error" => "Acción desconocida: $accion"]);
        break;
}
?>
