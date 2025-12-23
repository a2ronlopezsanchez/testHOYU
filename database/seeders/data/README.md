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

- `SKU` → Se guarda en `inventory_items.sku`
- `NOMBRE TECNICO INTERNO CON ID` → Se guarda en `inventory_items.name`
- `ID` → Se guarda en `inventory_items.item_id`
- `ETIQUETADO` (SI/NO)
- `COMENTARIOS` → Se guarda en `inventory_items.notes` y `condition`
- `CATEGORIA` → Crea/encuentra categoría automáticamente
- `MARCA` → Crea/encuentra marca automáticamente
- `MODELO` → Se guarda en `item_parents.model`
- `FAMILIA` → Se guarda en `item_parents.family`
- `SUB FAMILIA` → Se guarda en `item_parents.sub_family`
- `NOMBRE PARA COTIZACIONES` → Se guarda en:
  - `inventory_items.public_name`
  - `item_parents.name`
  - `item_parents.public_name`
- `COLOR` → Se guarda en `inventory_items.color` y `item_parents.color`
- `STATUS`
- `UBICACION` → Crea/encuentra ubicación automáticamente
- `UNITS/SET`
- `RACK` → Se guarda en `inventory_items.rack_position`
- `PANEL` → Se guarda en `inventory_items.panel_position`
- `IDENTIFICADOR` → Se guarda en `inventory_items.rfid_tag` (si etiquetado = SI)
- `NUMERO DE GARANTIA VIP` → Se guarda en `inventory_items.serial_number`
- `PRECIO ORIGINAL` → Se guarda en `inventory_items.original_price`
- `PRECIO RECIENTE`
- `PRECIO RENTA` → Se guarda en `inventory_items.ideal_rental_price`
- `PRECIO RENTA MINIMO` → Se guarda en `inventory_items.minimum_rental_price`

**Nota:**
- Los headers pueden tener espacios o guiones bajos, el seeder los reconocerá automáticamente.
- El archivo CSV debe estar en **UTF-8** para manejar correctamente caracteres especiales (á, é, í, ó, ú, ñ, etc.).

## Qué hace el seeder

✅ Lee el archivo CSV con encoding UTF-8 (caracteres especiales)
✅ Crea automáticamente las marcas que no existen
✅ Crea automáticamente las categorías que no existen
✅ Crea automáticamente las ubicaciones que no existen
✅ Crea `item_parents` inteligentemente:
   - Un nuevo padre se crea solo si difiere en: **MODELO, FAMILIA, SUB FAMILIA o NOMBRE PARA COTIZACIONES**
   - Ejemplo: Items BD011, BD012, BD013 con diferentes MODELO/FAMILIA crearán padres separados aunque compartan categoría y marca
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
