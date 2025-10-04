<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Incluir archivos de configuración
include_once '../config/database.php';
include_once '../config/SQLQueries.php';

class ApiRouter {
    private $db;
    private $queries;
    private $module;
    private $method;
    private $id;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->queries = new SQLQueries();
        
        // Obtener módulo de parámetro GET
        $this->module = isset($_GET['module']) ? $_GET['module'] : '';
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    }

    public function handleRequest() {
        // Validar módulo
        $validModules = [
            'categorias', 'productos', 'usuarios', 'bodegas', 
            'cajas', 'estados', 'tipos_documento', 'tipos_promocion', 'metodos_pago', 'proveedores'
			, 'ventas', 'turnos_caja'
        ];
        
        if (empty($this->module)) {
            $this->sendResponse(400, 'Parámetro "module" requerido. Módulos disponibles: ' . implode(', ', $validModules));
            return;
        }
        
        if (!in_array($this->module, $validModules)) {
            $this->sendResponse(400, 'Módulo no válido. Módulos disponibles: ' . implode(', ', $validModules));
            return;
        }

        try {
            switch ($this->method) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost();
                    break;
                case 'PUT':
                    $this->handlePut();
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                case 'OPTIONS':
                    $this->sendResponse(200, 'OK');
                    break;
                default:
                    $this->sendResponse(405, 'Método no permitido');
            }
        } catch (Exception $e) {
            $this->sendResponse(500, 'Error: ' . $e->getMessage());
        }
    }
	private function handleGet() {
		$moduleKey = str_replace('-', '_', $this->module);
		
		$queriesModule = $this->getQueriesForModule($moduleKey);
		
		if (!$queriesModule) {
			$this->sendResponse(400, 'Módulo no implementado: ' . $this->module);
			return;
		}
		
		if (!isset($queriesModule['listar'])) {
			$this->sendResponse(400, 'Método listar no implementado para: ' . $this->module);
			return;
		}
		
		$query = $queriesModule['listar'];
		
		try {
			$stmt = $this->db->prepare($query);
			$stmt->execute();
			$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

			// Parámetros de Bootstrap Table
			$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
			$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
			$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
			$search = isset($_GET['search']) ? trim($_GET['search']) : '';
			$sort = isset($_GET['sort']) ? $_GET['sort'] : 'id';
			$order = isset($_GET['order']) ? strtoupper($_GET['order']) : 'ASC';
			
			// Aplicar búsqueda si existe
			if (!empty($search)) {
				$data = array_filter($data, function($item) use ($search) {
					foreach ($item as $value) {
						if (is_string($value) && stripos($value, $search) !== false) {
							return true;
						}
					}
					return false;
				});
				$data = array_values($data);
			}
			
			// APLICAR ORDENAMIENTO
			if (!empty($sort) && count($data) > 0) {
				usort($data, function($a, $b) use ($sort, $order) {
					// Verificar si la columna existe en ambos registros
					if (!isset($a[$sort]) || !isset($b[$sort])) {
						return 0;
					}
					
					$valueA = $a[$sort];
					$valueB = $b[$sort];
					
					// Manejo especial para valores nulos
					if ($valueA === null && $valueB === null) return 0;
					if ($valueA === null) return ($order === 'ASC') ? 1 : -1;
					if ($valueB === null) return ($order === 'ASC') ? -1 : 1;
					
					// Comparación numérica si ambos valores son numéricos
					if (is_numeric($valueA) && is_numeric($valueB)) {
						$comparison = $valueA <=> $valueB;
					} 
					// Comparación de strings (case-insensitive)
					else {
						$comparison = strcasecmp($valueA, $valueB);
					}
					
					return ($order === 'DESC') ? -$comparison : $comparison;
				});
			}
			
			$total = count($data);
			
			// Calcular página correctamente
			if ($offset > 0) {
				$page = floor($offset / $limit) + 1;
			}
			
			$paginated_data = array_slice($data, $offset, $limit);

			$this->sendResponse(200, 'Datos obtenidos', [
				'data' => $paginated_data,
				'total' => $total,
				'page' => $page,
				'limit' => $limit,
				'totalPages' => ceil($total / $limit)
			]);
			
		} catch (PDOException $e) {
			error_log("Error en handleGet: " . $e->getMessage());
			$this->sendResponse(500, 'Error al obtener datos: ' . $e->getMessage());
		}
	}

    private function getQueriesForModule($moduleKey) {
        // Método seguro para obtener las consultas por módulo
        $methods = [
            'categorias' => 'categorias',
            'productos' => 'productos', 
            'usuarios' => 'usuarios',
            'bodegas' => 'bodegas',
            'cajas' => 'cajas',
            'estados' => 'estados',
            'tipos_documento' => 'tipos_documento',
            'tipos_promocion' => 'tipos_promocion',
            'metodos_pago' => 'metodos_pago',
            'proveedores' => 'proveedores',
            'ventas' => 'ventas',
            'turnos_caja' => 'turnos_caja'
        ];
        
        if (isset($methods[$moduleKey]) && method_exists($this->queries, $methods[$moduleKey])) {
            return call_user_func([$this->queries, $methods[$moduleKey]]);
        }
        
        return null;
    }

    private function handlePost() {
		$input = file_get_contents("php://input");
		$data = json_decode($input, true);
		
		if (!$data) {
			$this->sendResponse(400, 'Datos JSON inválidos. Input recibido: ' . $input);
			return;
		}

		$moduleKey = str_replace('-', '_', $this->module);
		$queriesModule = $this->getQueriesForModule($moduleKey);
		
		if (!$queriesModule) {
			$this->sendResponse(400, 'Módulo no implementado: ' . $this->module);
			return;
		}
		
		if (!isset($queriesModule['crear'])) {
			$this->sendResponse(400, 'Método crear no implementado para: ' . $this->module);
			return;
		}
		
		$query = $queriesModule['crear'];
		
		try {
			// Manejo especial para usuarios (password hashing)
			if ($this->module === 'usuarios' && isset($data['password'])) {
				$data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
				unset($data['password']);
			}

			// Manejo especial para productos (categorías)
			if ($this->module === 'productos' && isset($data['categoria_ids'])) {
				// Guardar el producto primero, luego las categorías
				$categoria_ids = $data['categoria_ids'];
				unset($data['categoria_ids']);
			}
			
			// Manejo especial para usuarios (password hashing)
			if ($this->module === 'usuarios' && isset($data['password'])) {
				$data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
				unset($data['password']);
			}

			$stmt = $this->db->prepare($query);
			$this->bindParams($stmt, $data);
			$stmt->execute();

			$result = $stmt->fetch(PDO::FETCH_ASSOC);
			
			// Para stored procedures que retornan TABLE(id INTEGER)
			$id_creado = $result['id'] ?? null;
			
			$this->sendResponse(201, ucfirst($this->module) . ' creado exitosamente', [
				'id' => $id_creado
			]);

			$result = $stmt->fetch(PDO::FETCH_ASSOC);
			
			// Si es producto, manejar las categorías después de crear
			if ($this->module === 'productos' && isset($categoria_ids)) {
				$producto_id = $result['id'];
				$this->asignarCategoriasProducto($producto_id, $categoria_ids);
			}
			
			$this->sendResponse(201, ucfirst($this->module) . ' creado exitosamente', [
				'id' => $result['id'] ?? $this->db->lastInsertId()
			]);
			
		} catch (PDOException $e) {
			error_log("Error de creación: " . $e->getMessage());
			$this->sendResponse(500, 'Error al crear registro: ' . $e->getMessage());
		}
	}

	// Método auxiliar para asignar categorías a productos
	private function asignarCategoriasProducto($producto_id, $categoria_ids) {
		if (empty($categoria_ids)) return;
		
		$categorias = explode(',', $categoria_ids);
		
		// Primero eliminar categorías existentes
		$deleteQuery = "DELETE FROM producto_categorias WHERE producto_id = :producto_id";
		$stmt = $this->db->prepare($deleteQuery);
		$stmt->bindParam(':producto_id', $producto_id, PDO::PARAM_INT);
		$stmt->execute();
		
		// Insertar nuevas categorías
		$insertQuery = "INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (:producto_id, :categoria_id)";
		$stmt = $this->db->prepare($insertQuery);
		
		foreach ($categorias as $categoria_id) {
			$stmt->bindParam(':producto_id', $producto_id, PDO::PARAM_INT);
			$stmt->bindParam(':categoria_id', $categoria_id, PDO::PARAM_INT);
			$stmt->execute();
		}
	}

    private function handlePut() {
        if (!$this->id) {
            $this->sendResponse(400, 'ID requerido para actualización');
            return;
        }

        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (!$data) {
            $this->sendResponse(400, 'Datos JSON inválidos. Input recibido: ' . $input);
            return;
        }
        
        $data['id'] = $this->id;

        $moduleKey = str_replace('-', '_', $this->module);
        $queriesModule = $this->getQueriesForModule($moduleKey);
        
        if (!$queriesModule) {
            $this->sendResponse(400, 'Módulo no implementado: ' . $this->module);
            return;
        }
        
        if (!isset($queriesModule['actualizar'])) {
            $this->sendResponse(400, 'Método actualizar no implementado para: ' . $this->module);
            return;
        }
        
        $query = $queriesModule['actualizar'];
        
        try {
            $stmt = $this->db->prepare($query);
            $this->bindParams($stmt, $data);
            $result = $stmt->execute();
            
            if ($result) {
                $this->sendResponse(200, ucfirst($this->module) . ' actualizado exitosamente');
            } else {
                $this->sendResponse(404, 'Registro no encontrado o no se pudo actualizar');
            }
            
        } catch (PDOException $e) {
            error_log("Error de actualización: " . $e->getMessage());
            $this->sendResponse(500, 'Error al actualizar registro: ' . $e->getMessage());
        }
    }

    private function handleDelete() {
        if (!$this->id) {
            $this->sendResponse(400, 'ID requerido para eliminación');
            return;
        }

        $moduleKey = str_replace('-', '_', $this->module);
        $queriesModule = $this->getQueriesForModule($moduleKey);
        
        if (!$queriesModule) {
            $this->sendResponse(400, 'Módulo no implementado: ' . $this->module);
            return;
        }
        
        if (!isset($queriesModule['eliminar'])) {
            $this->sendResponse(400, 'Método eliminar no implementado para: ' . $this->module);
            return;
        }
        
        $query = $queriesModule['eliminar'];
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $result = $stmt->execute();
            
            if ($result && $stmt->rowCount() > 0) {
                $this->sendResponse(200, ucfirst($this->module) . ' eliminado exitosamente');
            } else {
                $this->sendResponse(404, 'Registro no encontrado');
            }
            
        } catch (PDOException $e) {
            error_log("Error de eliminación: " . $e->getMessage());
            $this->sendResponse(500, 'Error al eliminar registro: ' . $e->getMessage());
        }
    }

    private function bindParams($stmt, $data) {
        foreach ($data as $key => $value) {
            $param = ':' . $key;
            if ($value === null || $value === '') {
                $stmt->bindValue($param, null, PDO::PARAM_NULL);
            } elseif (is_bool($value)) {
                $stmt->bindValue($param, $value, PDO::PARAM_BOOL);
            } elseif (is_int($value)) {
                $stmt->bindValue($param, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($param, $value);
            }
        }
    }

    private function sendResponse($code, $message, $data = []) {
        http_response_code($code);
        
        $response = [
            'success' => $code >= 200 && $code < 300,
            'message' => $message,
            'timestamp' => date('c')
        ];

        if (!empty($data)) {
            $response = array_merge($response, $data);
        }

        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}

// Manejar solicitud OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inicializar y manejar la solicitud
try {
    $router = new ApiRouter();
    $router->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fatal: ' . $e->getMessage(),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>