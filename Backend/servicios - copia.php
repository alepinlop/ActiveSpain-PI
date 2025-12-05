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
        if ($modelo->AnadeOferta($objeto->oferta))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "ModificaOferta":
        if ($modelo->ModificaOferta($objeto->oferta))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "BorraOferta":
        if ($modelo->BorraOferta($objeto->id))
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
        if ($modelo->AnadePeticion($objeto->peticion))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "ModificaPeticion":
        if ($modelo->ModificaPeticion($objeto->peticion))
            print '{"result":"OK"}';
        else
            print '{"result":"FAIL"}';
        break;

    case "BorraPeticion":
        if ($modelo->BorraPeticion($objeto->id))
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
