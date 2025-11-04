# Sistema de Codes para Brands y Categories

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [¿Cómo Funciona?](#cómo-funciona)
3. [Ejemplos de Codes](#ejemplos-de-codes)
4. [Generación de IDs de Items](#generación-de-ids-de-items)
5. [Comando de Actualización](#comando-de-actualización)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Descripción General

Este sistema genera automáticamente códigos únicos y cortos (`code`) para:
- **Categories** (ej: Audio, Video, Iluminación)
- **Brands** (ej: Shure, Sony, Alfa)

Estos codes se utilizan para generar los **IDs únicos** de cada `InventoryItem`.

### Ventajas

✅ **Sin colisiones**: Garantiza que Video+Alfa y Video+Americas tengan prefijos diferentes
✅ **Automático**: El usuario solo ingresa el nombre, el código se genera solo
✅ **Corto**: Codes de 1-4 letras en la mayoría de casos
✅ **Descriptivo**: "AUSH" claramente identifica Audio+Shure
✅ **Escalable**: Soporta hasta 1000 variaciones con números

---

## ¿Cómo Funciona?

### Algoritmo de Generación

Cuando creas una nueva **Category** o **Brand**, el sistema:

1. **Toma el nombre** (ej: "Computador")
2. **Limpia caracteres especiales** (solo letras A-Z, Ñ)
3. **Intenta con 1 letra**: `C`
   - ¿Ya existe? → Continúa
4. **Intenta con 2 letras**: `CO`
   - ¿Ya existe? → Continúa
5. **Intenta con 3 letras**: `COM`
   - Y así sucesivamente hasta 10 caracteres
6. **Si todo está ocupado**: Agrega número (`COMPUTADOR1`, `COMPUTADOR2`)
7. **Último recurso**: Agrega timestamp

### Reglas

- Los codes son **UPPERCASE** (mayúsculas)
- Solo contienen **letras** (A-Z, Ñ)
- Opcionalmente **números** al final si hay colisiones
- Son **únicos** en toda la tabla
- Se **preservan** al editar (no se regeneran)

---

## Ejemplos de Codes

### Categories

| Nombre | Code Generado | Explicación |
|--------|---------------|-------------|
| Audio | `A` | Primera letra disponible |
| Video | `V` | Audio ya tomó "A" |
| Cable | `C` | Primera letra disponible |
| Computador | `CO` | Cable ya tomó "C", se usa "CO" |
| Iluminación | `I` | Primera letra disponible |
| Microfonia | `M` | Primera letra disponible |
| Energia | `E` | Primera letra disponible |

### Brands

| Nombre | Code Generado | Explicación |
|--------|---------------|-------------|
| Shure | `S` | Primera letra disponible |
| Sony | `SO` | Shure ya tomó "S" |
| Alfa | `A` | Primera letra disponible |
| Americas | `AM` | Alfa ya tomó "A" |
| Yamaha | `Y` | Primera letra disponible |
| ElectroVoice | `E` | Primera letra disponible |

### Casos Especiales

| Nombre | Code Generado | Explicación |
|--------|---------------|-------------|
| 123Audio | `AUDIO` | Ignora números iniciales |
| Audio-Pro | `AUDIOPRO` | Ignora guiones |
| Café | `C` o `CA` | Ignora acentos |

---

## Generación de IDs de Items

Los IDs de los `InventoryItem` se componen de:

```
[CategoryCode] + [BrandCode] + [Secuencia]
```

### Ejemplos

| Category | Brand | Items |
|----------|-------|-------|
| Audio (A) | Shure (S) | `AS001`, `AS002`, `AS003`... |
| Audio (A) | Sony (SO) | `ASO001`, `ASO002`, `ASO003`... |
| Video (V) | Alfa (AL) | `VAL001`, `VAL002`, `VAL003`... |
| Video (V) | Americas (AM) | `VAM001`, `VAM002`... ✅ SIN COLISIÓN |
| Iluminación (I) | ElectroVoice (E) | `IE001`, `IE002`... |

### ✅ Ventaja: Sin Colisiones

**Antes** (usando solo primera letra):
```
Video + Alfa      → VA001
Video + Americas  → VA002  ❌ Mismo prefijo, no distinguible
```

**Ahora** (usando codes únicos):
```
Video (V) + Alfa (AL)      → VAL001  ✅
Video (V) + Americas (AM)  → VAM001  ✅ Prefijos diferentes!
```

---

## Comando de Actualización

### Actualizar Codes Existentes

Si ya tienes registros con codes largos o sin code, usa este comando:

```bash
php artisan inventory:update-codes
```

**Comportamiento:**
- Actualiza categorías y marcas **sin code** o con codes **largos** (> 4 caracteres)
- No modifica codes cortos existentes (< 4 caracteres)
- Muestra cada cambio realizado en consola

### Forzar Actualización de Todos

Para regenerar **todos** los codes (incluso los existentes):

```bash
php artisan inventory:update-codes --force
```

⚠️ **ADVERTENCIA**: Esto regenerará códigos existentes que podrían estar en uso. Úsalo solo si estás seguro.

### Ejemplo de Salida

```
🔄 Iniciando actualización de codes...

📁 Actualizando Categories...
   • Audio: 'AUDIO' → 'A'
   • Iluminación: 'ILUMINACION' → 'I'
   ✅ 2 categorías actualizadas

🏷️  Actualizando Brands...
   • ElectroVoice: 'ELECTROVOICE' → 'E'
   • Shure: '' → 'S'
   ✅ 2 marcas actualizadas

✨ Proceso completado exitosamente!
```

---

## Preguntas Frecuentes

### ¿Puedo especificar un code manualmente?

**Sí.** Al crear una categoría o marca, puedes enviar el campo `code` con un valor específico:

```javascript
{
  name: "Computador",
  code: "COMP" // ← Manual
}
```

El sistema respetará tu código si es único.

### ¿Qué pasa si agrego "Computadora" después de "Computador"?

El sistema intentará:
1. `C` → Ya existe (Computador)
2. `CO` → Ya existe (Computador)
3. `COM` → Ya existe (Computador)
4. `COMP` → Ya existe (Computador)
5. `COMPU` → **Disponible!** ✅

Resultado: "Computadora" → `COMPU`

### ¿Los codes se regeneran al editar?

**No.** Los codes solo se generan al crear. Si editas el nombre, el code permanece igual.

Si necesitas regenerar un code:
1. Edítalo manualmente, o
2. Usa `php artisan inventory:update-codes --force`

### ¿Qué pasa con registros eliminados (soft deleted)?

Los codes de registros con `deleted_at` no bloqueantes. Puedes reutilizar un code de un registro eliminado.

### ¿El campo code es obligatorio en el formulario?

**No.** El campo code está oculto en los formularios. El sistema lo genera automáticamente.

Si necesitas especificarlo manualmente, puedes:
- Enviarlo vía API
- Modificar temporalmente el formulario

### ¿Qué pasa si dos usuarios crean la misma categoría simultáneamente?

El campo `code` tiene constraint `UNIQUE` en la base de datos. Si hay colisión:
- La segunda transacción fallará
- El usuario verá un error de validación
- Debe intentar de nuevo (el sistema generará el siguiente code disponible)

---

## Código Fuente

### Controllers

- `app/Http/Controllers/CategoryController.php` → Método `generateUniqueCode()`
- `app/Http/Controllers/BrandController.php` → Método `generateUniqueCode()`

### Command

- `app/Console/Commands/UpdateBrandCategoryCodes.php`

### Uso en ID Generation

- `app/Http/Controllers/InventoryController.php` → Método `nextIdForParent()`

---

## Mantenimiento

### Revisar Codes Duplicados (Debugging)

```sql
-- Verificar duplicados en categories
SELECT code, COUNT(*) as count
FROM categories
WHERE deleted_at IS NULL
GROUP BY code
HAVING count > 1;

-- Verificar duplicados en brands
SELECT code, COUNT(*) as count
FROM brands
WHERE deleted_at IS NULL
GROUP BY code
HAVING count > 1;
```

### Regenerar Todos los Codes desde Cero

```bash
# Actualizar categorías
php artisan inventory:update-codes --force

# O manualmente en Tinker
php artisan tinker
>>> App\Models\Category::all()->each(function($c) {
      $c->code = /* lógica de generación */;
      $c->save();
    });
```

---

## Soporte

Para problemas o sugerencias sobre el sistema de codes, contacta al equipo de desarrollo.

**Última actualización**: 2025-11-04
