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
}
?>