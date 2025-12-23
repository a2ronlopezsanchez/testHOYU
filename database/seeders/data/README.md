# Importación de Inventario desde CSV

## Instrucciones

### 1. Exportar tu Excel a CSV

En Excel:
1. Abre tu archivo de inventario
2. Ve a **Archivo → Guardar como**
3. Selecciona **CSV (delimitado por comas) (*.csv)**
4. Guárdalo con el nombre: `inventory_data.csv`

### 2. Colocar el archivo CSV aquí

Coloca el archivo `inventory_data.csv` en esta carpeta:
```
database/seeders/data/inventory_data.csv
```

### 3. Ejecutar el seeder

En la terminal, ejecuta:
```bash
php artisan db:seed --class=InventoryCSVImportSeeder
```

## Headers esperados en el CSV

El CSV debe tener estos headers (tal como aparecen en tu Excel):

- `SKU`
- `NOMBRE TECNICO`
- `ID`
- `ETIQUETADO`
- `COMENTARIOS`
- `CATEGORIA`
- `MARCA`
- `MODELO`
- `FAMILIA`
- `SUB FAMILIA`
- `NOMBRE PARA USUARIO`
- `COLOR`
- `STATUS`
- `UBICACION`
- `UNITS/SET`
- `RACK`
- `PANEL`
- `IDENTIFICADOR`
- `NUMERO DE GARANTIA VIP`
- `PRECIO ORIGINAL`
- `PRECIO RECIENTE`
- `PRECIO RENTA`
- `MINIMO`

**Nota:** Los headers pueden tener espacios o guiones bajos, el seeder los reconocerá automáticamente.

## Qué hace el seeder

✅ Lee el archivo CSV
✅ Crea automáticamente las marcas que no existen
✅ Crea automáticamente las categorías que no existen
✅ Crea automáticamente las ubicaciones que no existen
✅ Omite items duplicados (por SKU o item_id)
✅ Muestra progreso cada 100 registros
✅ Muestra resumen al finalizar

## Ejemplo de salida

```
📂 Leyendo archivo CSV...
✓ Headers encontrados: SKU, NOMBRE TECNICO, ID, ETIQUETADO, COMENTARIOS...
📊 Procesados: 100 | Creados: 95 | Omitidos: 5 | Errores: 0
📊 Procesados: 200 | Creados: 190 | Omitidos: 10 | Errores: 0
...
============================================================
✅ Importación completada
📊 Resumen:
   • Total de filas procesadas: 3000
   • Items creados: 2850
   • Items omitidos (ya existían): 150
   • Errores: 0
============================================================
```

## Troubleshooting

### Error: "No se encontró el archivo CSV"
- Verifica que el archivo se llame exactamente `inventory_data.csv`
- Verifica que esté en la carpeta `database/seeders/data/`

### Error: "No se pudieron leer los headers del CSV"
- Asegúrate de exportar desde Excel como CSV UTF-8
- Verifica que la primera fila tenga los nombres de las columnas

### Muchos errores
- Revisa que los headers del CSV coincidan con los esperados
- Verifica que las columnas SKU e ID no estén vacías
