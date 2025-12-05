<?php
// modelos.php
class Modelo {

    private $pdo;

    public function __CONSTRUCT() {
        try {
            $opciones = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8");
            // Ajusta el nombre de la BD si lo cambiaste
            $this->pdo = new PDO('mysql:host=localhost;dbname=proyecto_integrado', 'root', '', $opciones);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(Exception $e) {
            die(json_encode(["error" => "Conexión BD fallida: " . $e->getMessage()]));
        }
    }

    // -------------------- USUARIOS --------------------

    public function ListarUsuarios() {
        try {
            $sc = "SELECT id, email, rol, nombre, apellidos, ciudad, telefono, descripcion, esta_activo, num_ofertas, num_peticiones, created_at, updated_at FROM usuarios ORDER BY nombre";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function ObtenerUsuarioId($id) {
        try {
            $sc = "SELECT id, email, rol, nombre, apellidos, ciudad, telefono, descripcion, esta_activo, num_ofertas, num_peticiones, created_at, updated_at FROM usuarios WHERE id = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_OBJ);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function AnadeUsuario($data) {
        try {
            // Espera $data con propiedades: email, password, rol, nombre, apellidos, ciudad, telefono, descripcion
            // Validaciones mínimas:
            if (empty($data->email) || empty($data->password) || empty($data->nombre)) {
                return false;
            }
            // comprobar email único
            $stm = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stm->execute(array($data->email));
            if ($stm->fetch()) return false;

            $hash = password_hash($data->password, PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("INSERT INTO usuarios (email, password_hash, rol, nombre, apellidos, ciudad, telefono, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute(array(
                $data->email,
                $hash,
                $data->rol ?? 'consumidor',
                $data->nombre,
                $data->apellidos ?? null,
                $data->ciudad ?? null,
                $data->telefono ?? null,
                $data->descripcion ?? null
            ));
            return true;
        } catch(Exception $e) {
            // En desarrollo mostrar error:
            // die($e->getMessage());
            return false;
        }
    }

    public function ModificaUsuario($data) {
        try {
            // Espera al menos id; campos opcionales para modificar
            if (empty($data->id)) return false;
            // Si se incluye password, re-hash
            if (!empty($data->password)) {
                $hash = password_hash($data->password, PASSWORD_DEFAULT);
                $sql = "UPDATE usuarios SET email = ?, password_hash = ?, rol = ?, nombre = ?, apellidos = ?, ciudad = ?, telefono = ?, descripcion = ?, esta_activo = ? WHERE id = ?";
                $this->pdo->prepare($sql)->execute(array(
                    $data->email ?? null,
                    $hash,
                    $data->rol ?? 'consumidor',
                    $data->nombre ?? null,
                    $data->apellidos ?? null,
                    $data->ciudad ?? null,
                    $data->telefono ?? null,
                    $data->descripcion ?? null,
                    isset($data->esta_activo) ? (int)$data->esta_activo : 1,
                    $data->id
                ));
            } else {
                $sql = "UPDATE usuarios SET email = ?, rol = ?, nombre = ?, apellidos = ?, ciudad = ?, telefono = ?, descripcion = ?, esta_activo = ? WHERE id = ?";
                $this->pdo->prepare($sql)->execute(array(
                    $data->email ?? null,
                    $data->rol ?? 'consumidor',
                    $data->nombre ?? null,
                    $data->apellidos ?? null,
                    $data->ciudad ?? null,
                    $data->telefono ?? null,
                    $data->descripcion ?? null,
                    isset($data->esta_activo) ? (int)$data->esta_activo : 1,
                    $data->id
                ));
            }
            return true;
        } catch(Exception $e) {
            //die($e->getMessage());
            return false;
        }
    }

    public function BorraUsuario($id) {
        try {
            $stm = $this->pdo->prepare("DELETE FROM usuarios WHERE id = ?");
            $stm->execute(array($id));
            return true;
        } catch(Exception $e) {
            return false;
        }
    }

    // Login: devolver usuario y api_token (genera token si no existe)
    public function LoginUsuario($email, $password) {
        try {
            $stm = $this->pdo->prepare("SELECT id, email, password_hash, rol, nombre, apellidos, ciudad, telefono, descripcion, api_token FROM usuarios WHERE email = ?");
            $stm->execute(array($email));
            $user = $stm->fetch(PDO::FETCH_ASSOC);
            if (!$user) return ["result"=>"FAIL", "error"=>"Usuario no encontrado"];

            // Si el hash en seed antiguo es SHA2 (64 hex) puedes manejarlo aquí. Asumimos password_hash en nuevas cuentas.
            if (!password_verify($password, $user['password_hash'])) {
                // fallback: probar SHA256 seeds (si quieres)
                if (hash('sha256', $password) !== $user['password_hash']) {
                    return ["result"=>"FAIL", "error"=>"Credenciales incorrectas"];
                } else {
                    // migrar a password_hash (opcional)
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $upd = $this->pdo->prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?");
                    $upd->execute(array($newHash, $user['id']));
                }
            }

            // generar token si no existe
            if (empty($user['api_token'])) {
                $token = bin2hex(random_bytes(32));
                $upd = $this->pdo->prepare("UPDATE usuarios SET api_token = ? WHERE id = ?");
                $upd->execute(array($token, $user['id']));
            } else {
                $token = $user['api_token'];
            }

            // devolver datos relevantes
            unset($user['password_hash']);
            $user['api_token'] = $token;
            return ["result"=>"OK", "user"=>$user];
        } catch(Exception $e) {
            return ["result"=>"FAIL", "error"=>$e->getMessage()];
        }
    }

    // -------------------- OFERTAS --------------------

    public function ListarOfertas() {
        try {
            $sc = "SELECT o.*, u.nombre AS ofertante_nombre, u.apellidos AS ofertante_apellidos 
                   FROM ofertas o
                   JOIN usuarios u ON o.usuario_id = u.id
                   WHERE o.estado = 'publicada'
                   ORDER BY o.fechahora_inicio ASC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function ObtenerOfertaId($id) {
        try {
            $sc = "SELECT o.*, u.nombre AS ofertante_nombre, u.apellidos AS ofertante_apellidos 
                   FROM ofertas o
                   JOIN usuarios u ON o.usuario_id = u.id
                   WHERE o.id = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_OBJ);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function ListarOfertasUsuario($usuario_id) {
        try {
            $sc = "SELECT * FROM ofertas WHERE usuario_id = ? ORDER BY fechahora_inicio ASC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($usuario_id));
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function AnadeOferta($data) {
        try {
            // Verificar que usuario existe y rol = ofertante
            $stm = $this->pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
            $stm->execute(array($data->usuario_id));
            $usr = $stm->fetch(PDO::FETCH_ASSOC);
            if (!$usr) return false;
            if ($usr['rol'] !== 'ofertante') return false;

            $sql = "INSERT INTO ofertas (usuario_id, titulo, descripcion, actividad_tipo, lugar_ciudad, lugar_direccion, fechahora_inicio, tarifa, preparacion_fisica, duracion_horas, material_necesario, material_ofertado, plazas_min, plazas_max, transport_incluido, estado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->usuario_id,
                $data->titulo ?? '',
                $data->descripcion ?? null,
                $data->actividad_tipo ?? null,
                $data->lugar_ciudad ?? null,
                $data->lugar_direccion ?? null,
                $data->fechahora_inicio ?? null,
                $data->tarifa ?? 0.0,
                $data->preparacion_fisica ?? 'Media',
                $data->duracion_horas ?? 1.0,
                !empty($data->material_necesario) ? 1 : 0,
                $data->material_ofertado ?? null,
                $data->plazas_min ?? 1,
                $data->plazas_max ?? 10,
                !empty($data->transport_incluido) ? 1 : 0,
                $data->estado ?? 'publicada'
            ));
            return true;
        } catch(Exception $e) {
            //die($e->getMessage());
            return false;
        }
    }

    public function ModificaOferta($data) {
        try {
            // Comprobar que la oferta pertenece al usuario si se pasa usuario_id (lógica de seguridad)
            if (empty($data->id)) return false;

            // Construcción simple del UPDATE (actualiza campos dados)
            $sql = "UPDATE ofertas SET titulo = ?, descripcion = ?, actividad_tipo = ?, lugar_ciudad = ?, lugar_direccion = ?, fechahora_inicio = ?, tarifa = ?, preparacion_fisica = ?, duracion_horas = ?, material_necesario = ?, material_ofertado = ?, plazas_min = ?, plazas_max = ?, transport_incluido = ?, estado = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->titulo ?? '',
                $data->descripcion ?? null,
                $data->actividad_tipo ?? null,
                $data->lugar_ciudad ?? null,
                $data->lugar_direccion ?? null,
                $data->fechahora_inicio ?? null,
                $data->tarifa ?? 0.0,
                $data->preparacion_fisica ?? 'Media',
                $data->duracion_horas ?? 1.0,
                !empty($data->material_necesario) ? 1 : 0,
                $data->material_ofertado ?? null,
                $data->plazas_min ?? 1,
                $data->plazas_max ?? 10,
                !empty($data->transport_incluido) ? 1 : 0,
                $data->estado ?? 'publicada',
                $data->id
            ));
            return true;
        } catch(Exception $e) {
            //die($e->getMessage());
            return false;
        }
    }

    public function BorraOferta($id) {
        try {
            $stm = $this->pdo->prepare("DELETE FROM ofertas WHERE id = ?");
            $stm->execute(array($id));
            return true;
        } catch(Exception $e) {
            return false;
        }
    }

    // -------------------- PETICIONES --------------------

    public function ListarPeticiones() {
        try {
            $sc = "SELECT p.*, u.nombre AS consumidor_nombre, u.apellidos AS consumidor_apellidos 
                   FROM peticiones p
                   JOIN usuarios u ON p.usuario_id = u.id
                   WHERE p.estado = 'activa'
                   ORDER BY p.fechahora_deseada ASC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function ObtenerPeticionId($id) {
        try {
            $sc = "SELECT p.*, u.nombre AS consumidor_nombre, u.apellidos AS consumidor_apellidos 
                   FROM peticiones p
                   JOIN usuarios u ON p.usuario_id = u.id
                   WHERE p.id = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_OBJ);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function ListarPeticionesUsuario($usuario_id) {
        try {
            $sc = "SELECT * FROM peticiones WHERE usuario_id = ? ORDER BY fechahora_deseada ASC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($usuario_id));
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            die($e->getMessage());
        }
    }

    public function AnadePeticion($data) {
        try {
            // Verificar usuario existe y rol = consumidor
            $stm = $this->pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
            $stm->execute(array($data->usuario_id));
            $usr = $stm->fetch(PDO::FETCH_ASSOC);
            if (!$usr) return false;
            if ($usr['rol'] !== 'consumidor') return false;

            $sql = "INSERT INTO peticiones (usuario_id, titulo, descripcion, actividad_tipo, lugar_ciudad, lugar_direccion, fechahora_deseada, duracion_horas, necesidades_concretas, presupuesto_min, presupuesto_max, contacto_telefono, estado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->usuario_id,
                $data->titulo ?? '',
                $data->descripcion ?? null,
                $data->actividad_tipo ?? null,
                $data->lugar_ciudad ?? null,
                $data->lugar_direccion ?? null,
                $data->fechahora_deseada ?? null,
                $data->duracion_horas ?? 1.0,
                $data->necesidades_concretas ?? null,
                $data->presupuesto_min ?? null,
                $data->presupuesto_max ?? null,
                $data->contacto_telefono ?? null,
                $data->estado ?? 'activa'
            ));
            return true;
        } catch(Exception $e) {
            //die($e->getMessage());
            return false;
        }
    }

    public function ModificaPeticion($data) {
        try {
            if (empty($data->id)) return false;
            $sql = "UPDATE peticiones SET titulo = ?, descripcion = ?, actividad_tipo = ?, lugar_ciudad = ?, lugar_direccion = ?, fechahora_deseada = ?, duracion_horas = ?, necesidades_concretas = ?, presupuesto_min = ?, presupuesto_max = ?, contacto_telefono = ?, estado = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->titulo ?? '',
                $data->descripcion ?? null,
                $data->actividad_tipo ?? null,
                $data->lugar_ciudad ?? null,
                $data->lugar_direccion ?? null,
                $data->fechahora_deseada ?? null,
                $data->duracion_horas ?? 1.0,
                $data->necesidades_concretas ?? null,
                $data->presupuesto_min ?? null,
                $data->presupuesto_max ?? null,
                $data->contacto_telefono ?? null,
                $data->estado ?? 'activa',
                $data->id
            ));
            return true;
        } catch(Exception $e) {
            return false;
        }
    }

    public function BorraPeticion($id) {
        try {
            $stm = $this->pdo->prepare("DELETE FROM peticiones WHERE id = ?");
            $stm->execute(array($id));
            return true;
        } catch(Exception $e) {
            return false;
        }
    }

} // class Modelo
?>
