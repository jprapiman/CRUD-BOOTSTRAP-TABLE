<?php
class SQLQueries {
    
    public static function categorias() {
        return [
            'listar' => "SELECT * FROM sp_categorias_listar()",
            'crear' => "SELECT sp_categorias_crear(:nombre, :descripcion, :categoria_padre_id, :activo) as id",
            'actualizar' => "SELECT sp_categorias_actualizar(:id, :nombre, :descripcion, :categoria_padre_id, :activo) as success",
            'eliminar' => "SELECT sp_categorias_eliminar(:id) as success"
        ];
    }
	public static function productos() {
		return [
			'listar' => "SELECT * FROM sp_productos_listar()",
			'crear' => "SELECT sp_productos_crear(:sku, :nombre, :descripcion, :precio_compra, :precio_venta, :unidad_medida, :tiene_iva, :activo) as id",
			'actualizar' => "SELECT sp_productos_actualizar(:id, :sku, :nombre, :descripcion, :precio_compra, :precio_venta, :unidad_medida, :tiene_iva, :activo) as success",
			'eliminar' => "SELECT sp_productos_eliminar(:id) as success"
		];
	}    public static function usuarios() {
        return [
            'listar' => "SELECT * FROM sp_usuarios_listar()",
            'crear' => "SELECT sp_usuarios_crear(:username, :password_hash, :nombre, :apellido, :email, :telefono, :rol, :activo) as id",
            'actualizar' => "UPDATE usuarios SET username = :username, nombre = :nombre, apellido = :apellido, email = :email, telefono = :telefono, rol = :rol, activo = :activo WHERE id = :id",
            'eliminar' => "UPDATE usuarios SET activo = false WHERE id = :id"
        ];
    }

    public static function bodegas() {
        return [
            'listar' => "SELECT * FROM sp_bodegas_listar()",
            'crear' => "SELECT sp_bodegas_crear(:nombre, :codigo, :direccion, :es_principal, :activa) as id",
            'actualizar' => "UPDATE bodegas SET nombre = :nombre, codigo = :codigo, direccion = :direccion, es_principal = :es_principal, activa = :activa WHERE id = :id",
            'eliminar' => "UPDATE bodegas SET activa = false WHERE id = :id"
        ];
    }

    public static function cajas() {
        return [
            'listar' => "SELECT * FROM sp_cajas_listar()",
            'crear' => "SELECT sp_cajas_crear(:nombre, :codigo, :bodega_id, :activa) as id",
            'actualizar' => "UPDATE cajas SET nombre = :nombre, codigo = :codigo, bodega_id = :bodega_id, activa = :activa WHERE id = :id",
            'eliminar' => "UPDATE cajas SET activa = false WHERE id = :id"
        ];
    }

    public static function estados() {
        return [
            'listar' => "SELECT * FROM sp_estados_listar()",
            'crear' => "SELECT sp_estados_crear(:modulo, :codigo, :nombre, :descripcion, :orden, :es_activo) as id",
            'actualizar' => "UPDATE estados SET modulo = :modulo, codigo = :codigo, nombre = :nombre, descripcion = :descripcion, orden = :orden, es_activo = :es_activo WHERE id = :id",
            'eliminar' => "DELETE FROM estados WHERE id = :id"
        ];
    }

    public static function tipos_documento() {
        return [
            'listar' => "SELECT * FROM sp_tipos_documento_listar()",
            'crear' => "SELECT sp_tipos_documento_crear(:codigo, :nombre, :descripcion, :requiere_cliente, :serie, :correlativo_actual, :activo) as id",
            'actualizar' => "UPDATE tipos_documento SET codigo = :codigo, nombre = :nombre, descripcion = :descripcion, requiere_cliente = :requiere_cliente, serie = :serie, activo = :activo WHERE id = :id",
            'eliminar' => "UPDATE tipos_documento SET activo = false WHERE id = :id"
        ];
    }

    public static function tipos_promocion() {
        return [
            'listar' => "SELECT * FROM sp_tipos_promocion_listar()",
            'crear' => "SELECT sp_tipos_promocion_crear(:codigo, :nombre, :descripcion, :formula, :activo) as id",
            'actualizar' => "UPDATE tipos_promocion SET codigo = :codigo, nombre = :nombre, descripcion = :descripcion, formula = :formula, activo = :activo WHERE id = :id",
            'eliminar' => "UPDATE tipos_promocion SET activo = false WHERE id = :id"
        ];
    }

    public static function metodos_pago() {
        return [
            'listar' => "SELECT * FROM sp_metodos_pago_listar()",
            'crear' => "SELECT sp_metodos_pago_crear(:codigo, :nombre, :descripcion, :requiere_referencia, :orden, :activo) as id",
            'actualizar' => "UPDATE metodos_pago SET codigo = :codigo, nombre = :nombre, descripcion = :descripcion, requiere_referencia = :requiere_referencia, orden = :orden, activo = :activo WHERE id = :id",
            'eliminar' => "UPDATE metodos_pago SET activo = false WHERE id = :id"
        ];
    }

    public static function proveedores() {
        return [
            'listar' => "SELECT * FROM sp_proveedores_listar()",
            'crear' => "SELECT sp_proveedores_crear(:nombre, :rut, :telefono, :email, :direccion, :activo) as id",
            'actualizar' => "UPDATE proveedores SET nombre = :nombre, rut = :rut, telefono = :telefono, email = :email, direccion = :direccion, activo = :activo WHERE id = :id",
            'eliminar' => "UPDATE proveedores SET activo = false WHERE id = :id"
        ];
    }
	
	public static function ventas() {
		return [
			'listar' => "SELECT * FROM sp_ventas_listar()"
		];
	}

	public static function turnos_caja() {
		return [
			'listar' => "SELECT * FROM sp_turnos_caja_listar()"
		];
	}
    
    // ==========================================
    // CONFIGURACIÓN DEL SISTEMA
    // ==========================================
    
    public static function configuracion_sistema() {
        return [
            'obtener_completa' => "SELECT sp_configuracion_obtener_completa() as configuracion",
            'obtener_por_clave' => "SELECT valor FROM configuracion_sistema WHERE clave = :clave",
            'actualizar' => "UPDATE configuracion_sistema SET valor = :valor WHERE clave = :clave"
        ];
    }
    
    public static function modulos_config() {
        return [
            'listar' => "SELECT * FROM sp_modulos_listar()",
            'obtener_por_codigo' => "SELECT * FROM sp_modulos_obtener_por_codigo(:codigo)",
            'crear' => "SELECT sp_modulos_crear(:codigo, :singular, :plural, :icono, :genero, :descripcion, :tab_id, :table_id, :tiene_formulario, :orden) as id",
            'actualizar' => "SELECT sp_modulos_actualizar(:id, :codigo, :singular, :plural, :icono, :genero, :descripcion, :tab_id, :table_id, :tiene_formulario, :orden) as success",
            'eliminar' => "UPDATE modulos SET activo = false WHERE id = :id"
        ];
    }
    
    public static function modulo_columnas_formulario() {
        return [
            'listar_por_modulo' => "SELECT * FROM sp_modulo_columnas_formulario_listar(:modulo_id)",
            'crear' => "SELECT sp_modulo_columnas_formulario_crear(:modulo_id, :nombre, :label, :tipo, :requerido, :placeholder, :valor_defecto, :opciones, :validaciones, :orden) as id"
        ];
    }
    
    public static function modulo_columnas_tabla() {
        return [
            'listar_por_modulo' => "SELECT * FROM sp_modulo_columnas_tabla_listar(:modulo_id)",
            'crear' => "SELECT sp_modulo_columnas_tabla_crear(:modulo_id, :field, :title, :sortable, :width, :align, :orden) as id"
        ];
    }
    
    public static function modulo_acciones() {
        return [
            'listar_por_modulo' => "SELECT * FROM sp_modulo_acciones_listar(:modulo_id)"
        ];
    }
    
    public static function estructura_menu() {
        return [
            'listar' => "SELECT * FROM sp_estructura_menu_listar()"
        ];
    }
    
    public static function textos_sistema() {
        return [
            'listar_por_categoria' => "SELECT * FROM sp_textos_sistema_listar(:categoria, :idioma)"
        ];
    }
}
?>