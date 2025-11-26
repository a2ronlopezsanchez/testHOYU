<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\ItemParent;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Location;
use App\Models\EventAssignment;
use App\Models\Event;
use App\Models\Specification;
use App\Models\MaintenanceRecord;
use App\Models\ItemImage;
use App\Models\InventoryItemDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class InventoryController extends Controller
{
    public function lookups(): JsonResponse
    {
        // Si tienes scopes de activo, puedes usar ->where('is_active', true)
        return response()->json([
            'success'    => true,
            'categories' => Category::orderBy('name')->pluck('name'),   // ["AUDIO", ...]
            'brands'     => Brand::orderBy('name')->pluck('name'),      // ["SHURE", ...]
            'locations'  => Location::orderBy('name')->pluck('name'),   // ["ALMACEN", ...]
        ]);
    }
    /**
     * Get inventory items optimized for DataTables
     */
    public function getInventoryItems(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $category = $request->get('category', 'all');
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);
        $orderColumn = $request->get('order_column', 'id');
        $orderDirection = $request->get('order_direction', 'asc');

        // Query base con relaciones
        $query = ItemParent::with([
            'category',
            'brand',
            'items' => function ($query) {
                $query->where('is_active', true);
            }
        ])->where('is_active', true);

        // Filtro por categoría
        if ($category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('code', $category);
            });
        }

        // Filtro de búsqueda global
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('public_name', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%")
                  ->orWhereHas('brand', function ($brandQuery) use ($search) {
                      $brandQuery->where('name', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Ordenamiento
        $validColumns = ['id', 'name', 'public_name', 'model'];
        if (in_array($orderColumn, $validColumns)) {
            $query->orderBy($orderColumn, $orderDirection);
        } else {
            $query->orderBy('id', 'desc');
        }

        // Obtener resultados paginados
        $itemParents = $query->paginate($perPage, ['*'], 'page', $page);

        // Transformar datos para DataTables
        $transformedItems = $itemParents->getCollection()->map(function ($itemParent) use ($date) {
            return $this->transformItemParentForDataTable($itemParent, $date);
        });



        return response()->json([
            'success' => true,
            'data' => $transformedItems,
            'pagination' => [
                'current_page' => $itemParents->currentPage(),
                'total' => $itemParents->total(),
                'per_page' => $itemParents->perPage(),
                'last_page' => $itemParents->lastPage(),
                'from' => $itemParents->firstItem(),
                'to' => $itemParents->lastItem(),
            ],
            'recordsTotal' => $itemParents->total(),
            'recordsFiltered' => $itemParents->total()
        ]);
    }

    /**
     * Get detailed item information
     */
    public function getItemDetails(Request $request, $itemParentId): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        
        // Buscar en base de datos
        $itemParent = ItemParent::with([
            'category',
            'brand',
            'items.location'
        ])->find($itemParentId);

        // Si no se encuentra en BD, verificar si es dato de muestra
        if (!$itemParent) {
            
            return response()->json([
                'success' => false,
                'message' => 'Item no encontrado'
            ], 404);
        }

        $transformedItem = $this->transformItemParentForDataTable($itemParent, $date);
        
        // Agregar información detallada de unidades
        $transformedItem['units'] = $itemParent->items->map(function ($item, $index) {
            return [
                'id' => $item->item_id ?: $item->id,
                'numeroSerie' => $item->serial_number ?: "SN{$item->id}",
                'condicion' => $item->condition ?: 'BUENO',
                'status' => $item->status,
                'ubicacion' => $item->location->name ?? 'ALMACEN',
                'eventos' => [] // Placeholder for events - integrate with your booking system
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedItem
        ]);
    }

    /**
     * Generate sample units for demo items
     */
    private function generateSampleUnits($sampleItem)
    {
        $units = [];
        $totalUnits = $sampleItem['totalUnits'] ?? 4;
        
        for ($i = 1; $i <= $totalUnits; $i++) {
            $units[] = [
                'id' => $sampleItem['id'] . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'numeroSerie' => $sampleItem['numeroSerie'] ?? 'SN-DEMO-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'condicion' => ['EXCELENTE', 'BUENO', 'BUENO', 'REGULAR'][array_rand(['EXCELENTE', 'BUENO', 'BUENO', 'REGULAR'])],
                'status' => 'ACTIVO',
                'ubicacion' => 'ALMACEN',
                'eventos' => []
            ];
        }
        
        return $units;
    }

    /**
     * Transform ItemParent for DataTable consumption
     */
    private function transformItemParentForDataTable($itemParent, $date)
    {
        $category = $itemParent->category;
        $brand = $itemParent->brand;
        $firstItem = $itemParent->items->first();
        
        // Calculate availability for the specific date
        $availability = $this->calculateAvailability($itemParent, $date);

        return [
            'id' => $itemParent->id,
            'sku' => $firstItem->sku ?? "BP" . str_pad($itemParent->id, 6, '0', STR_PAD_LEFT),
            'nombreProducto' => $itemParent->name,
            'nombrePublico' => $itemParent->public_name ?: $itemParent->name,
            'categoria' => $category->code ?? 'GENERAL',
            'marca' => $brand->name ?? 'SIN MARCA',
            'modelo' => $itemParent->model ?: '',
            'familia' => $itemParent->family ?: '',
            'subFamilia' => $itemParent->sub_family ?: '',
            'color' => $itemParent->color ?: 'NEGRO',
            'status' => $firstItem->status ?? 'ACTIVO',
            'ubicacion' => $firstItem->location->name ?? 'ALMACEN',
            'totalUnits' => $itemParent->items->count(),
            'availability' => $availability,
            
            // Additional fields for advanced features
            'precioOriginal' => (float)($firstItem->original_price ?? 0),
            'precioRentaIdeal' => (float)($firstItem->ideal_rental_price ?? 0),
            'precioRentaMinimo' => (float)($firstItem->minimum_rental_price ?? 0),
            'numeroSerie' => $firstItem->serial_number ?: '',
            'identificadorRfid' => $firstItem->rfid_tag ?: '',
            'rack' => $firstItem->rack_position ?: '',
            'panel' => $firstItem->panel_position ?: '',
            'garantiaVigente' => $firstItem->warranty_valid ? 'SI' : 'NO',
            'unitSet' => $firstItem->unit_set ?? 'UNIT',
        ];
    }

    /**
     * Calculate availability for a specific date
     */
   private function calculateAvailability($itemParent, $date)
    {
        return $this->calculateRealAvailability($itemParent, $date);
    }

    /**
     * Get categories for filters
     */
    public function getCategories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'icon', 'color']);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get brands for filters
     */
    public function getBrands(): JsonResponse
    {
        $brands = Brand::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }

    /**
     * Get locations for filters
     */
    public function getLocations(): JsonResponse
    {
        $locations = Location::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'location_type']);

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }
 
    public function storeParent(Request $request): JsonResponse
    {
        // Validación básica: recibimos solo NOMBRES para category/brand
        $request->validate([
            'name'         => ['required','string','max:255'],
            'public_name'  => ['nullable','string','max:255'],
            'category'     => ['required','string','max:255'],
            'brand'        => ['required','string','max:255'],
            'model'        => ['nullable','string','max:100'],
            'family'       => ['nullable','string','max:100'],
            'sub_family'   => ['nullable','string','max:100'],
            'color'        => ['nullable','string','max:50'],
            'is_active'    => ['nullable','boolean'],
        ]);

        try {
            // Normalizamos entradas (trim)
            $categoryName = trim((string) $request->input('category'));
            $brandName    = trim((string) $request->input('brand'));

            // Buscar Category y Brand por NOMBRE (case-insensitive)
            // Nota: si tu collation ya es case-insensitive, where('name', $categoryName) funciona igual.
            $categoryId = Category::whereRaw('LOWER(name) = ?', [mb_strtolower($categoryName, 'UTF-8')])->value('id');
            $brandId    = Brand::whereRaw('LOWER(name) = ?', [mb_strtolower($brandName, 'UTF-8')])->value('id');

            if (!$categoryId) {
                return response()->json([
                    'success' => false,
                    'message' => "La categoría '{$categoryName}' no existe."
                ], 422);
            }

            if (!$brandId) {
                return response()->json([
                    'success' => false,
                    'message' => "La marca '{$brandName}' no existe."
                ], 422);
            }

            // Crear el Item Padre
            $parent = ItemParent::create([
                'name'         => (string) $request->string('name'),
                'public_name'  => $request->filled('public_name') ? (string) $request->string('public_name') : (string) $request->string('name'),
                'category_id'  => $categoryId,
                'brand_id'     => $brandId,
                'model'        => (string) $request->input('model', ''),
                'family'       => (string) $request->input('family', ''),
                'sub_family'   => (string) $request->input('sub_family', ''),
                'color'        => (string) $request->input('color', ''),
                'is_active'    => (bool) $request->boolean('is_active', true),
                'created_by'   => auth()->id() ?? 1,
            ]);

            $parent->load(['category','brand']);

            return response()->json([
                'success' => true,
                'message' => 'Item Padre creado correctamente',
                'data' => [
                    'id'            => $parent->id,
                    'name'          => $parent->name,
                    'public_name'   => $parent->public_name,
                    'category'      => $parent->category?->name,
                    'brand'         => $parent->brand?->name,
                    'model'         => $parent->model,
                    'family'        => $parent->family,
                    'sub_family'    => $parent->sub_family,
                    'color'         => $parent->color,
                    'is_active'     => (bool) $parent->is_active,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el Item Padre: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store new inventory item
     */
    public function store(Request $request): JsonResponse
    {
        // Determinar si es borrador (autoguardado) o guardado final
        $isDraft = $request->boolean('is_draft', false);

        // Validación según payload que envías desde el front
        // Si es borrador, validación laxa; si es final, validación completa
        $rules = [
            'item_parent_id'      => ['required','integer','exists:item_parents,id'],
            'sku'                 => ['nullable','string','max:50','unique:inventory_items,sku'],
            'item_id'             => ['nullable','string','max:50','unique:inventory_items,item_id'],
            'name'                => [$isDraft ? 'nullable' : 'required','string','max:255'],
            'public_name'         => ['nullable','string','max:255'],
            'description'         => ['nullable','string'],

            // Identificadores
            'serial_number'       => ['nullable','string','max:100'],
            'rfid_tag'            => ['nullable','string','max:50'],
            'color'               => ['nullable','string','max:120'],
            'unit_set'            => [$isDraft ? 'nullable' : 'required','in:UNIT,SET'],
            'total_units'         => ['nullable','integer','min:1'],

            // ubicación: puedes mandar id o nombre
            'location'            => [$isDraft ? 'nullable' : 'nullable','string','max:255'],
            'rack_position'       => ['nullable','string','max:50'],
            'panel_position'      => ['nullable','string','max:50'],

            // aceptamos texto y normalizamos
            'status'              => [$isDraft ? 'nullable' : 'required','string','max:30'],
            'condition'           => ['nullable','in:EXCELENTE,BUENO,REGULAR,MALO'],

            // Precios y garantía
            'purchase_date'       => ['nullable','date'],
            'original_price'      => ['nullable','numeric','min:0'],
            'ideal_rental_price'  => ['nullable','numeric','min:0'],
            'minimum_rental_price'=> ['nullable','numeric','min:0'],
            'warranty_valid'      => ['boolean'],

            // Notas
            'notes'               => ['nullable','string'],

            // Especificaciones
            'specifications'      => ['nullable','array'],
            'specifications.*.name' => ['required_with:specifications','string','max:100'],
            'specifications.*.value' => ['nullable','string','max:255'],

            // Control
            'is_draft'            => ['boolean'],
        ];

        $request->validate($rules);

        try {
            // 1) Padre (traemos categoría/marca para ID y respuesta)
            $parent = ItemParent::with(['category:id,name','brand:id,name'])
                ->findOrFail($request->integer('item_parent_id'));

            // 2) Resolver ubicación por ID o por NOMBRE (case/acento-insensible)
            // Para borradores sin ubicación, usamos la ubicación especial "PENDIENTE"
            $locationId = null;
            $locName = trim((string) $request->input('location'));

            if ($locName !== '') {
                // a) Coincidencia exacta (si tu collation ya es case-insensitive, con esto basta)
                $locationId = Location::where('name', $locName)->value('id');

                // b) Case-insensitive explícito
                if (!$locationId) {
                    $locationId = Location::whereRaw('LOWER(name) = ?', [mb_strtolower($locName, 'UTF-8')])->value('id');
                }

                // c) (Opcional) Acento-insensible en memoria
                if (!$locationId) {
                    $target = Str::lower(Str::ascii($locName));
                    $row = Location::select('id','name')->get()
                        ->first(fn($r) => Str::lower(Str::ascii((string)$r->name)) === $target);
                    $locationId = $row?->id;
                }

                // Validar que la ubicación existe
                if (!$locationId) {
                    return response()->json([
                        'success' => false,
                        'message' => "La ubicación '{$locName}' no existe."
                    ], 422);
                }

                // Si NO es borrador, validar que no sea PENDIENTE
                if (!$isDraft && $locName === 'PENDIENTE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Debes seleccionar una ubicación válida para guardar el item.'
                    ], 422);
                }
            } else {
                // No hay ubicación seleccionada
                if ($isDraft) {
                    // Para borradores, usar ubicación PENDIENTE
                    $locationId = Location::where('name', 'PENDIENTE')->value('id');

                    if (!$locationId) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Error: No se encontró la ubicación PENDIENTE. Ejecuta las migraciones.'
                        ], 500);
                    }
                } else {
                    // Para guardado final, la ubicación es OBLIGATORIA
                    return response()->json([
                        'success' => false,
                        'message' => 'La ubicación es obligatoria para guardar el item.'
                    ], 422);
                }
            }

            // 3) Normalizar status ("EN REPARACION" -> "EN_REPARACION") ignorando acentos
            // Para borradores sin status, usamos 'PENDIENTE'
            $status = null;
            $statusIn = (string) $request->input('status');

            if ($statusIn !== '') {
                $status = strtoupper(str_replace(' ', '_', Str::ascii($statusIn)));
                $validStatuses = ['ACTIVO','INACTIVO','DESCOMPUESTO','EN_REPARACION','EXTRAVIADO','BAJA','PENDIENTE'];
                if (!in_array($status, $validStatuses, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status inválido.'
                    ], 422);
                }

                // Si NO es borrador, validar que no sea PENDIENTE
                if (!$isDraft && $status === 'PENDIENTE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Debes seleccionar un status válido para guardar el item.'
                    ], 422);
                }
            } else {
                // No hay status seleccionado
                if ($isDraft) {
                    // Para borradores, usar PENDIENTE
                    $status = 'PENDIENTE';
                } else {
                    // Para guardado final, el status es OBLIGATORIO
                    return response()->json([
                        'success' => false,
                        'message' => 'El status es obligatorio.'
                    ], 422);
                }
            }

            // 4) SKU e ItemID (si no vienen, generamos)
            $sku = (string) $request->input('sku', '');
            if ($sku === '') {
                $sku = $this->generateUniqueSku(); // helper abajo
            }

            $itemId = (string) $request->input('item_id', '');
            if ($itemId === '') {
                $itemId = $this->generateUniqueItemIdFromParent($parent); // helper abajo
            }

            // 5) Crear InventoryItem
            $inventoryItem = InventoryItem::create([
                'sku'                  => $sku,
                'item_id'              => $itemId,
                'name'                 => $request->filled('name') ? (string) $request->string('name') : null,
                'public_name'          => $request->filled('public_name')
                                            ? (string) $request->string('public_name')
                                            : ($request->filled('name') ? (string) $request->string('name') : null),
                'description'          => $request->filled('description') ? (string) $request->string('description') : null,
                'item_parent_id'       => $parent->id,

                // Identificadores
                'serial_number'        => (string) $request->input('serial_number', ''),
                'rfid_tag'             => (string) $request->input('rfid_tag', ''),
                'color'                => $request->filled('color') ? (string) $request->string('color') : null,
                'unit_set'             => (string) $request->input('unit_set', 'UNIT'),
                'total_units'          => (int) $request->input('total_units', 1),

                // Ubicación y estado
                'location_id'          => $locationId,
                'rack_position'        => (string) $request->input('rack_position', ''),
                'panel_position'       => (string) $request->input('panel_position', ''),
                'status'               => $status, // Ya tiene valor PENDIENTE si es borrador sin status
                'condition'            => (string) $request->input('condition', 'BUENO'),

                // Precios y garantía
                'purchase_date'        => $request->filled('purchase_date') ? $request->date('purchase_date') : null,
                'original_price'       => $request->input('original_price', 0),
                'ideal_rental_price'   => $request->input('ideal_rental_price', 0),
                'minimum_rental_price' => $request->input('minimum_rental_price', 0),
                'warranty_valid'       => (bool) $request->boolean('warranty_valid', false),

                // Notas
                'notes'                => $request->filled('notes') ? (string) $request->string('notes') : null,

                // Control
                'is_active'            => true,
                'is_draft'             => $isDraft,
                'created_by'           => auth()->id() ?? 1,
            ]);

            // 6) Guardar especificaciones si se enviaron
            if ($request->filled('specifications') && is_array($request->input('specifications'))) {
                $specifications = $request->input('specifications');
                foreach ($specifications as $index => $spec) {
                    if (!empty($spec['name'])) {
                        Specification::create([
                            'item_id' => $inventoryItem->id,
                            'name' => $spec['name'],
                            'value' => $spec['value'] ?? '',
                        ]);
                    }
                }
            }

            // 7) Respuesta formateada para tu grilla (lo mismo que espera tu front)
            $inventoryItem->load(['parent.category','parent.brand','location']);

            $grid = [
                'database_id'       => $inventoryItem->id, // ID de base de datos para actualizaciones
                'sku'               => $inventoryItem->sku,
                'nombreProducto'    => $inventoryItem->name,
                'id'                => $inventoryItem->item_id,
                'categoria'         => $inventoryItem->parent?->category?->name ?? '',
                'marca'             => $inventoryItem->parent?->brand?->name ?? '',
                'modelo'            => $inventoryItem->parent?->model ?? '',
                'familia'           => $inventoryItem->parent?->family ?? '',
                'subFamilia'        => $inventoryItem->parent?->sub_family ?? '',
                'nombrePublico'     => $inventoryItem->public_name,
                'color'             => $inventoryItem->parent?->color ?? '',
                'status'            => str_replace('_',' ',$inventoryItem->status), // para UI
                'ubicacion'         => $inventoryItem->location?->name ?? '',
                'unitSet'           => $inventoryItem->unit_set,
                'rack'              => $inventoryItem->rack_position,
                'panel'             => $inventoryItem->panel_position,
                'identificadorRfid' => $inventoryItem->rfid_tag,
                'numeroSerie'       => $inventoryItem->serial_number,
                'garantiaVigente'   => $inventoryItem->warranty_valid ? 'SI' : 'NO',
                'precioOriginal'    => (float) $inventoryItem->original_price,
                'precioRentaIdeal'  => (float) $inventoryItem->ideal_rental_price,
                'precioRentaMinimo' => (float) $inventoryItem->minimum_rental_price,
                'totalUnits'        => 1,
                'units' => [[
                    'id'          => $inventoryItem->item_id.'-01',
                    'numeroSerie' => $inventoryItem->serial_number ?: 'SN000001',
                    'condicion'   => $inventoryItem->condition ?: 'BUENO',
                    'eventos'     => []
                ]],
            ];

            return response()->json([
                'success' => true,
                'message' => 'Item creado exitosamente',
                'data'    => $grid,
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el item: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update inventory item
     */
    public function update(Request $request, $itemParentId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'public_name' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:100',
            'family' => 'nullable|string|max:100',
            'sub_family' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
        ]);

        try {
            $itemParent = ItemParent::findOrFail($itemParentId);
            
            $itemParent->update([
                'name' => $request->name,
                'public_name' => $request->public_name ?: $request->name,
                'model' => $request->model,
                'family' => $request->family,
                'sub_family' => $request->sub_family,
                'color' => $request->color,
            ]);

            $responseData = $this->transformItemParentForDataTable($itemParent, now()->format('Y-m-d'));

            return response()->json([
                'success' => true,
                'message' => 'Item actualizado exitosamente',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing InventoryItem (unidad individual)
     * Soporta tanto borradores (autoguardado) como guardado final
     */
    public function updateItem(Request $request, $inventoryItemId): JsonResponse
    {
        // Determinar si es borrador (autoguardado) o guardado final
        $isDraft = $request->boolean('is_draft', false);

        // Validación condicional según si es borrador o final
        $rules = [
            'name'                => [$isDraft ? 'nullable' : 'required','string','max:255'],
            'public_name'         => ['nullable','string','max:255'],
            'description'         => ['nullable','string'],

            // Identificadores
            'serial_number'       => ['nullable','string','max:100'],
            'rfid_tag'            => ['nullable','string','max:50'],
            'color'               => ['nullable','string','max:120'],
            'unit_set'            => [$isDraft ? 'nullable' : 'required','in:UNIT,SET'],
            'total_units'         => ['nullable','integer','min:1'],

            // Ubicación
            'location'            => ['nullable','string','max:255'],
            'rack_position'       => ['nullable','string','max:50'],
            'panel_position'      => ['nullable','string','max:50'],

            // Estado
            'status'              => [$isDraft ? 'nullable' : 'required','string','max:30'],
            'condition'           => ['nullable','in:EXCELENTE,BUENO,REGULAR,MALO'],

            // Precios y garantía
            'purchase_date'       => ['nullable','date'],
            'original_price'      => ['nullable','numeric','min:0'],
            'ideal_rental_price'  => ['nullable','numeric','min:0'],
            'minimum_rental_price'=> ['nullable','numeric','min:0'],
            'warranty_valid'      => ['boolean'],

            // Notas
            'notes'               => ['nullable','string'],

            // Especificaciones
            'specifications'      => ['nullable','array'],
            'specifications.*.name' => ['required_with:specifications','string','max:100'],
            'specifications.*.value' => ['nullable','string','max:255'],

            // Control
            'is_draft'            => ['boolean'],
        ];

        $request->validate($rules);

        try {
            $inventoryItem = InventoryItem::findOrFail($inventoryItemId);

            // Resolver ubicación si viene
            $locationId = $inventoryItem->location_id; // Mantener la actual por defecto
            $locName = trim((string) $request->input('location'));

            if ($locName !== '') {
                $locationId = Location::where('name', $locName)->value('id');
                if (!$locationId) {
                    $locationId = Location::whereRaw('LOWER(name) = ?', [mb_strtolower($locName, 'UTF-8')])->value('id');
                }
                if (!$locationId) {
                    $target = Str::lower(Str::ascii($locName));
                    $row = Location::select('id','name')->get()
                        ->first(fn($r) => Str::lower(Str::ascii((string)$r->name)) === $target);
                    $locationId = $row?->id;
                }

                // Validar que la ubicación existe
                if (!$locationId) {
                    return response()->json([
                        'success' => false,
                        'message' => "La ubicación '{$locName}' no existe."
                    ], 422);
                }

                // Si NO es borrador, validar que no sea PENDIENTE
                if (!$isDraft && $locName === 'PENDIENTE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Debes seleccionar una ubicación válida para guardar el item.'
                    ], 422);
                }
            } else {
                // No se envió ubicación en el request
                // Si es borrador y la ubicación actual está vacía o es PENDIENTE, mantener PENDIENTE
                if ($isDraft && (!$inventoryItem->location_id ||
                    $inventoryItem->location?->name === 'PENDIENTE')) {
                    $locationId = Location::where('name', 'PENDIENTE')->value('id');
                }
            }

            // Normalizar status si viene
            $status = $inventoryItem->status; // Mantener el actual por defecto
            $statusIn = (string) $request->input('status');

            if ($statusIn !== '') {
                $status = strtoupper(str_replace(' ', '_', Str::ascii($statusIn)));
                $validStatuses = ['ACTIVO','INACTIVO','DESCOMPUESTO','EN_REPARACION','EXTRAVIADO','BAJA','PENDIENTE'];
                if (!in_array($status, $validStatuses, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status inválido.'
                    ], 422);
                }

                // Si NO es borrador, validar que no sea PENDIENTE
                if (!$isDraft && $status === 'PENDIENTE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Debes seleccionar un status válido para guardar el item.'
                    ], 422);
                }
            } else {
                // No se envió status en el request
                // Si es borrador y el status actual es PENDIENTE o está vacío, mantener PENDIENTE
                if ($isDraft && (!$inventoryItem->status || $inventoryItem->status === 'PENDIENTE')) {
                    $status = 'PENDIENTE';
                }
            }

            // Actualizar el item
            $updateData = [
                'is_draft' => $isDraft,
            ];

            if ($request->filled('name')) {
                $updateData['name'] = (string) $request->string('name');
            }
            if ($request->filled('public_name')) {
                $updateData['public_name'] = (string) $request->string('public_name');
            }
            if ($request->filled('description')) {
                $updateData['description'] = (string) $request->string('description');
            }

            // Identificadores
            if ($request->filled('serial_number')) {
                $updateData['serial_number'] = (string) $request->input('serial_number');
            }
            if ($request->filled('rfid_tag')) {
                $updateData['rfid_tag'] = (string) $request->input('rfid_tag');
            }
            if ($request->filled('color')) {
                $updateData['color'] = (string) $request->string('color');
            }
            if ($request->filled('unit_set')) {
                $updateData['unit_set'] = (string) $request->input('unit_set');
            }
            if ($request->has('total_units')) {
                $updateData['total_units'] = (int) $request->input('total_units', 1);
            }

            // Ubicación y estado
            if ($locationId) {
                $updateData['location_id'] = $locationId;
            }
            if ($request->filled('rack_position')) {
                $updateData['rack_position'] = (string) $request->input('rack_position');
            }
            if ($request->filled('panel_position')) {
                $updateData['panel_position'] = (string) $request->input('panel_position');
            }
            if ($status) {
                $updateData['status'] = $status;
            }
            if ($request->filled('condition')) {
                $updateData['condition'] = (string) $request->input('condition');
            }

            // Precios y garantía
            if ($request->filled('purchase_date')) {
                $updateData['purchase_date'] = $request->date('purchase_date');
            }
            if ($request->has('original_price')) {
                $updateData['original_price'] = $request->input('original_price', 0);
            }
            if ($request->has('ideal_rental_price')) {
                $updateData['ideal_rental_price'] = $request->input('ideal_rental_price', 0);
            }
            if ($request->has('minimum_rental_price')) {
                $updateData['minimum_rental_price'] = $request->input('minimum_rental_price', 0);
            }
            if ($request->has('warranty_valid')) {
                $updateData['warranty_valid'] = (bool) $request->boolean('warranty_valid', false);
            }

            // Notas
            if ($request->filled('notes')) {
                $updateData['notes'] = (string) $request->string('notes');
            }

            $inventoryItem->update($updateData);

            // Actualizar especificaciones si se enviaron
            if ($request->has('specifications')) {
                // Eliminar especificaciones existentes
                $inventoryItem->specifications()->delete();

                // Crear nuevas especificaciones
                if (is_array($request->input('specifications'))) {
                    $specifications = $request->input('specifications');
                    foreach ($specifications as $index => $spec) {
                        if (!empty($spec['name'])) {
                            Specification::create([
                                'item_id' => $inventoryItem->id,
                                'name' => $spec['name'],
                                'value' => $spec['value'] ?? '',
                            ]);
                        }
                    }
                }
            }

            // Recargar relaciones
            $inventoryItem->load(['parent.category','parent.brand','location']);

            // Preparar respuesta con formato similar al store()
            $responseData = [
                'database_id'       => $inventoryItem->id,
                'sku'               => $inventoryItem->sku,
                'nombreProducto'    => $inventoryItem->name,
                'id'                => $inventoryItem->item_id,
                'ubicacion'         => $inventoryItem->location?->name ?? '',
                'status'            => str_replace('_',' ',$inventoryItem->status),
                'is_draft'          => $inventoryItem->is_draft,
            ];

            return response()->json([
                'success' => true,
                'message' => $isDraft ? 'Borrador guardado automáticamente' : 'Item actualizado exitosamente',
                'data' => $responseData,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el item: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete inventory item (soft delete)
     */
    public function destroy($itemParentId): JsonResponse
    {
        try {
            $itemParent = ItemParent::findOrFail($itemParentId);

            // Soft delete the parent and all related items
            $itemParent->update(['is_active' => false]);
            $itemParent->items()->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Item eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el item: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Generate unique SKU
     */
    private function generateUniqueSku()
    {
        do {
            $sku = 'BP' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (InventoryItem::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Generate unique Item ID from parent
     */
    private function generateUniqueItemIdFromParent($parent)
    {
        $catName = strtoupper((string)($parent->category?->name ?? ''));
        $brName  = strtoupper((string)($parent->brand?->name ?? ''));

        // Iniciales (primer carácter alfabético)
        $catInitial = $this->firstAlpha($catName) ?: 'X';
        $brInitial  = $this->firstAlpha($brName)  ?: 'X';

        $prefix = $catInitial . $brInitial; // "MS", "PL", etc.

        // Buscar el mayor correlativo existente para ese prefijo
        $ids = InventoryItem::where('item_id', 'like', $prefix . '%')->pluck('item_id');

        $max = 0;
        $regex = '/^'.preg_quote($prefix, '/').'(\d+)$/i';
        foreach ($ids as $id) {
            if (preg_match($regex, $id, $m)) {
                $n = (int)$m[1];
                if ($n > $max) $max = $n;
            }
        }
        $next = $max + 1;

        // Formatear: 001..999 y de ahí 1000, 1001, ...
        $suffix = $next <= 999 ? str_pad((string)$next, 3, '0', STR_PAD_LEFT) : (string)$next;

        return $prefix . $suffix;
    }


    public function parentsList(): JsonResponse
    {
        // Asegúrate de tener: public function items(){ return $this->hasMany(InventoryItem::class, 'item_parent_id'); }
        $parents = ItemParent::with(['category:id,name,icon', 'brand:id,name'])
            ->withCount(['items as units_count' => function ($q) {
                // Si tienes bandera is_active en los items y quieres contar sólo activos:
                $q->where('is_active', true);
            }])
            ->orderBy('public_name')
            ->get()
            ->map(function ($p) {
                return [
                    'id'           => $p->id,
                    'name'         => $p->name,
                    'public_name'  => $p->public_name,
                    'category'     => $p->category?->name,
                    'icon'         => $p->category?->icon,
                    'brand'        => $p->brand?->name,
                    'model'        => $p->model,
                    'family'       => $p->family,
                    'sub_family'   => $p->sub_family,
                    'color'        => $p->color,
                    'units_count'  => (int) $p->units_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $parents,
        ]);
    }


    public function nextIdForParent(ItemParent $parent): JsonResponse
    {
        // Usar los codes de category y brand directamente
        $categoryCode = strtoupper((string)($parent->category?->code ?? 'X'));
        $brandCode    = strtoupper((string)($parent->brand?->code ?? 'X'));

        // Prefijo combinado: ej. "AUSH" (Audio + Shure), "VIAL" (Video + Alfa)
        $prefix = $categoryCode . $brandCode;

        // Buscar el mayor correlativo existente para ese prefijo
        $ids = InventoryItem::where('item_id', 'like', $prefix . '%')->pluck('item_id');

        $max = 0;
        $regex = '/^'.preg_quote($prefix, '/').'(\d+)$/i';
        foreach ($ids as $id) {
            if (preg_match($regex, $id, $m)) {
                $n = (int)$m[1];
                if ($n > $max) $max = $n;
            }
        }
        $next = $max + 1;

        // Formatear: 001..999 y de ahí 1000, 1001, ...
        $suffix = $next <= 999 ? str_pad((string)$next, 3, '0', STR_PAD_LEFT) : (string)$next;
        $nextId = $prefix . $suffix;

        return response()->json([
            'success' => true,
            'prefix'  => $prefix,
            'category_code' => $categoryCode,
            'brand_code' => $brandCode,
            'next'    => $next,
            'id'      => $nextId,
        ]);
    }
    public function itemsByParent(ItemParent $parent): JsonResponse
    {
        $items = InventoryItem::with(['location:id,name'])
            ->where('item_parent_id', $parent->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($i) {
                return [
                    'id'          => $i->id,                     // Database ID (agregado)
                    'sku'         => $i->sku,
                    'item_id'     => $i->item_id,
                    'serial'      => $i->serial_number,
                    'status'      => $i->status,                 // p.ej. "EN_REPARACION"
                    'location'    => $i->location?->name ?? '-',
                    'rack'        => $i->rack_position,
                    'panel'       => $i->panel_position,
                    'condition'   => $i->condition ?? 'BUENO',   // "EXCELENTE|BUENO|REGULAR|MALO"
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }
    // Agregar estos métodos a tu InventoryController.php existente

    /**
     * Get availability for specific item parent on a specific date
     */
    public function getItemAvailability(Request $request, $itemParentId): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        
        try {
            $itemParent = ItemParent::with(['items'])->findOrFail($itemParentId);
            $availability = $this->calculateRealAvailability($itemParent, $date);
            
            return response()->json([
                'success' => true,
                'data' => $availability
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular disponibilidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get availability for multiple items on a specific date
     */
    public function getBulkAvailability(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $itemParentIds = $request->get('item_parent_ids', []);
        
        if (empty($itemParentIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No se proporcionaron IDs de items'
            ], 400);
        }
        
        try {
            $itemParents = ItemParent::with(['items'])->whereIn('id', $itemParentIds)->get();
            $availabilities = [];
            
            foreach ($itemParents as $itemParent) {
                $availabilities[$itemParent->id] = $this->calculateRealAvailability($itemParent, $date);
            }
            
            return response()->json([
                'success' => true,
                'data' => $availabilities
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular disponibilidades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate real availability based on EventAssignments
     */
    private function calculateRealAvailability($itemParent, $date): array
    {
        $dateToCheck = Carbon::parse($date)->startOfDay();
        $totalUnits = $itemParent->items->where('is_active', true)->count();
        
        if ($totalUnits === 0) {
            return [
                'available' => 0,
                'assigned' => 0,
                'maintenance' => 0,
                'totalUnits' => 0,
                'unavailable' => 0
            ];
        }
        
        // Obtener todas las unidades del item parent
        $itemIds = $itemParent->items->where('is_active', true)->pluck('id');
        
        // Buscar asignaciones que se solapen con la fecha seleccionada
        $assignments = EventAssignment::whereIn('inventory_item_id', $itemIds)
            ->where(function ($query) use ($dateToCheck) {
                $query->whereDate('assigned_from', '<=', $dateToCheck)
                    ->whereDate('assigned_until', '>=', $dateToCheck);
            })
            ->whereNotIn('assignment_status', ['FINALIZADO', 'CANCELADO'])
            ->with(['event', 'item'])
            ->get();
        
        // Contar unidades por estado
        $assigned = 0;
        $maintenance = 0;
        $unavailable = 0; // Para otros estados como EXTRAVIADO, DESCOMPUESTO, etc.
        
        // Agrupar por inventory_item_id para evitar contar la misma unidad múltiples veces
        $assignedItemIds = $assignments->pluck('inventory_item_id')->unique();
        
        foreach ($assignedItemIds as $itemId) {
            $item = $itemParent->items->where('id', $itemId)->first();
            
            if (!$item) continue;
            
            // Verificar el estado del item
            switch ($item->status) {
                case 'EN_REPARACION':
                case 'MANTENIMIENTO':
                    $maintenance++;
                    break;
                case 'EXTRAVIADO':
                case 'DESCOMPUESTO':
                case 'BAJA':
                    $unavailable++;
                    break;
                default:
                    // Verificar si está en un evento de mantenimiento
                    $hasMaintenanceEvent = $assignments->where('inventory_item_id', $itemId)
                        ->where('event.event_type', 'MANTENIMIENTO')
                        ->isNotEmpty();
                    
                    if ($hasMaintenanceEvent) {
                        $maintenance++;
                    } else {
                        $assigned++;
                    }
            }
        }
        
        // Calcular unidades no disponibles por estado del item (sin asignación)
        $unassignedItems = $itemParent->items->where('is_active', true)
            ->whereNotIn('id', $assignedItemIds);
        
        foreach ($unassignedItems as $item) {
            switch ($item->status) {
                case 'EN_REPARACION':
                case 'MANTENIMIENTO':
                    $maintenance++;
                    break;
                case 'EXTRAVIADO':
                case 'DESCOMPUESTO':
                case 'BAJA':
                    $unavailable++;
                    break;
            }
        }
        
        // Calcular disponibles
        $available = $totalUnits - $assigned - $maintenance - $unavailable;
        $available = max(0, $available); // No puede ser negativo
        
        return [
            'available' => $available,
            'assigned' => $assigned,
            'maintenance' => $maintenance,
            'unavailable' => $unavailable,
            'totalUnits' => $totalUnits,
            'date' => $dateToCheck->format('Y-m-d')
        ];
    }

    /**
     * VISTAS BLADE - Métodos para renderizar las vistas
     */

    /**
     * Vista de disponibilidad e inventario
     */
    public function disponibilidad()
    {
        return view('inventory.disponibilidad');
    }

    /**
     * Vista detallada de un item
     */
    public function detalle($id)
    {
        // Obtener el item con sus relaciones
        $itemParent = ItemParent::with([
            'category',
            'brand',
            'items.location',
            'items' => function ($query) {
                $query->where('is_active', true);
            }
        ])->findOrFail($id);

        // Calcular disponibilidad actual
        $availability = $this->calculateRealAvailability($itemParent, now()->format('Y-m-d'));

        return view('inventory.detalle', compact('itemParent', 'availability'));
    }

    /**
     * Vista de formulario para crear o editar item
     */
    public function formulario($id = null)
    {
        $itemParent = null;
        $inventoryItem = null;
        $mode = 'new';

        if ($id) {
            $itemParent = ItemParent::with([
                'category',
                'brand',
                'items.location'
            ])->findOrFail($id);

            // Detectar modo: edit (editar parent), new-from-parent (crear nueva unidad), o edit-unit (editar unidad específica)
            $queryMode = request()->query('mode');
            $unitId = request()->query('unit_id');

            if ($queryMode === 'new-from-parent') {
                $mode = 'new-from-parent';
            } elseif ($queryMode === 'edit-unit' && $unitId) {
                $mode = 'edit-unit';
                // Cargar el InventoryItem específico con sus specifications e imágenes
                $inventoryItem = InventoryItem::with([
                    'location',
                    'specifications',
                    'images' => function($query) {
                        $query->orderBy('order', 'asc');
                    }
                ])->findOrFail($unitId);
            } else {
                $mode = 'edit';
            }
        }

        return view('inventory.formulario', compact('itemParent', 'mode', 'inventoryItem'));
    }

    /**
     * Vista detallada de una unidad individual (InventoryItem)
     */
    public function detalleUnidad($id)
    {
        // Obtener el InventoryItem con sus relaciones
        $inventoryItem = InventoryItem::with([
            'parent.category',
            'parent.brand',
            'location',
            'specifications',  // Cargar especificaciones del item
            'documents' => function($query) {
                $query->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);

        // Usar el parent del item
        $itemParent = $inventoryItem->parent;

        // Calcular disponibilidad actual del parent
        $availability = $this->calculateRealAvailability($itemParent, now()->format('Y-m-d'));

        // Actualizar estados de mantenimientos vencidos antes de cargar
        MaintenanceRecord::where('inventory_item_id', $id)
            ->where('maintenance_status', 'PROGRAMADO')
            ->whereDate('scheduled_date', '<', now()->toDateString())
            ->update(['maintenance_status' => 'VENCIDO']);

        // Cargar registros de mantenimiento para esta unidad
        $maintenanceRecords = MaintenanceRecord::where('inventory_item_id', $id)
            ->orderBy('scheduled_date', 'desc')
            ->get();

        // Calcular última inspección (último mantenimiento COMPLETADO)
        $lastInspection = MaintenanceRecord::where('inventory_item_id', $id)
            ->where('maintenance_status', 'COMPLETADO')
            ->orderBy('completion_date', 'desc')
            ->first();
        $lastInspectionDate = $lastInspection ? $lastInspection->completion_date->format('d/m/Y') : 'Sin registros';

        // Calcular próxima inspección (siguiente mantenimiento NO completado, ordenado por fecha más cercana)
        $nextInspection = MaintenanceRecord::where('inventory_item_id', $id)
            ->whereIn('maintenance_status', ['PROGRAMADO', 'VENCIDO'])
            ->orderBy('scheduled_date', 'asc')
            ->first();

        $nextInspectionDate = $nextInspection ? $nextInspection->scheduled_date->format('d/m/Y') : 'Sin programar';
        $nextInspectionOverdue = false;

        if ($nextInspection && $nextInspection->scheduled_date->isPast()) {
            $nextInspectionOverdue = true;
        }

        // Verificar si hay mantenimientos vencidos y calcular días de atraso
        $overdueMaintenances = MaintenanceRecord::where('inventory_item_id', $id)
            ->where('maintenance_status', 'VENCIDO')
            ->orderBy('scheduled_date', 'asc')
            ->get();

        $overdueDays = null;
        $hasOverdueMaintenance = $overdueMaintenances->count() > 0;

        if ($hasOverdueMaintenance) {
            // Obtener el más antiguo (primera fecha vencida)
            $oldestOverdue = $overdueMaintenances->first();
            $overdueDays = now()->diffInDays($oldestOverdue->scheduled_date);
        }

        // Cargar registros de uso (event_assignments) para esta unidad con su evento
        $usageRecords = EventAssignment::where('inventory_item_id', $id)
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calcular estadísticas de uso
        $totalEvents = EventAssignment::where('inventory_item_id', $id)->count();
        $totalHours = EventAssignment::where('inventory_item_id', $id)->sum('hours_used') ?? 0;
        $totalMaintenances = MaintenanceRecord::where('inventory_item_id', $id)->count();

        // Próximos eventos programados (todos los que no sean DEVUELTO)
        $upcomingEvents = EventAssignment::where('event_assignments.inventory_item_id', $id)
            ->where('event_assignments.assignment_status', '!=', 'DEVUELTO')
            ->join('events', 'event_assignments.event_id', '=', 'events.id')
            ->select('event_assignments.*')
            ->with('event')
            ->orderBy('events.start_date', 'desc')
            ->get();

        return view('inventory.detalle', compact(
            'itemParent',
            'availability',
            'inventoryItem',
            'maintenanceRecords',
            'lastInspectionDate',
            'nextInspectionDate',
            'nextInspectionOverdue',
            'hasOverdueMaintenance',
            'overdueDays',
            'usageRecords',
            'totalEvents',
            'totalHours',
            'totalMaintenances',
            'upcomingEvents'
        ));
    }

    /**
     * Actualizar las notas de una unidad específica (InventoryItem)
     */
    public function actualizarNotas(Request $request, $id)
    {
        try {
            // Validar que se envió el campo notes
            $validated = $request->validate([
                'notes' => 'nullable|string|max:1000'
            ]);

            // Buscar el InventoryItem
            $inventoryItem = InventoryItem::findOrFail($id);

            // Actualizar las notas
            $inventoryItem->notes = $validated['notes'];
            $inventoryItem->save();

            return response()->json([
                'success' => true,
                'message' => 'Notas actualizadas correctamente',
                'notes' => $inventoryItem->notes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar las notas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dar de baja una unidad específica (InventoryItem)
     */
    public function darDeBaja(Request $request, $id)
    {
        try {
            // Validar los datos
            $validated = $request->validate([
                'decommission_reason' => 'required|string|max:50',
                'decommission_notes' => 'nullable|string|max:500'
            ]);

            // Buscar el InventoryItem
            $inventoryItem = InventoryItem::findOrFail($id);

            // Verificar que no esté ya dado de baja
            if ($inventoryItem->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este item ya está dado de baja'
                ], 400);
            }

            // Actualizar campos de dar de baja
            $inventoryItem->status = 'BAJA';
            $inventoryItem->decommission_reason = $validated['decommission_reason'];
            $inventoryItem->decommission_notes = $validated['decommission_notes'] ?? null;
            $inventoryItem->decommissioned_by = auth()->id();
            $inventoryItem->decommissioned_at = now();
            $inventoryItem->save();

            // Hacer soft delete
            $inventoryItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item dado de baja correctamente',
                'data' => [
                    'decommission_reason' => $inventoryItem->decommission_reason,
                    'decommission_notes' => $inventoryItem->decommission_notes,
                    'decommissioned_by' => $inventoryItem->decommissioned_by,
                    'decommissioned_at' => $inventoryItem->decommissioned_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al dar de baja el item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed unit status for a specific date
     */
    public function getUnitDetails(Request $request, $itemParentId): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        
        try {
            $itemParent = ItemParent::with(['items.location'])->findOrFail($itemParentId);
            $dateToCheck = Carbon::parse($date)->startOfDay();
            
            $units = [];
            
            foreach ($itemParent->items->where('is_active', true) as $item) {
                // Buscar asignación activa para esta fecha
                $assignment = EventAssignment::where('inventory_item_id', $item->id)
                    ->where(function ($query) use ($dateToCheck) {
                        $query->whereDate('assigned_from', '<=', $dateToCheck)
                            ->whereDate('assigned_until', '>=', $dateToCheck);
                    })
                    ->whereNotIn('assignment_status', ['FINALIZADO', 'CANCELADO'])
                    ->with(['event'])
                    ->first();
                
                $unitStatus = 'available';
                $eventInfo = null;
                
                if ($assignment) {
                    if ($assignment->event && $assignment->event->event_type === 'MANTENIMIENTO') {
                        $unitStatus = 'maintenance';
                    } else {
                        $unitStatus = 'assigned';
                    }
                    
                    $eventInfo = [
                        'event_code' => $assignment->event->event_code ?? '',
                        'event_name' => $assignment->event->name ?? '',
                        'start_date' => $assignment->assigned_from,
                        'end_date' => $assignment->assigned_until,
                        'venue' => $assignment->event->venue_name ?? '',
                        'status' => $assignment->assignment_status
                    ];
                } else {
                    // Verificar estado del item sin asignación
                    switch ($item->status) {
                        case 'EN_REPARACION':
                        case 'MANTENIMIENTO':
                            $unitStatus = 'maintenance';
                            break;
                        case 'EXTRAVIADO':
                        case 'DESCOMPUESTO':
                        case 'BAJA':
                            $unitStatus = 'unavailable';
                            break;
                    }
                }
                
                $units[] = [
                    'db_id' => $item->id,  // Database ID para el botón de editar
                    'id' => $item->item_id ?: $item->id,
                    'sku' => $item->sku,
                    'serial_number' => $item->serial_number,
                    'status' => $unitStatus,
                    'item_status' => $item->status,
                    'condition' => $item->condition,
                    'location' => $item->location->name ?? 'Sin ubicación',
                    'rack_position' => $item->rack_position,
                    'panel_position' => $item->panel_position,
                    'event' => $eventInfo
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'item_parent' => [
                        'id' => $itemParent->id,
                        'name' => $itemParent->name,
                        'public_name' => $itemParent->public_name
                    ],
                    'date' => $dateToCheck->format('Y-m-d'),
                    'units' => $units,
                    'summary' => $this->calculateRealAvailability($itemParent, $date)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles de unidades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar un nuevo mantenimiento para una unidad
     */
    public function registrarMantenimiento(Request $request, $id)
    {
        try {
            // Validar los datos
            $validated = $request->validate([
                'maintenance_type' => 'required|string|max:50',
                'scheduled_date' => 'required|date',
                'technician_name' => 'required|string|max:100',
                'total_cost' => 'nullable|numeric|min:0',
                'work_description' => 'nullable|string|max:1000'
            ]);

            // Buscar el InventoryItem
            $inventoryItem = InventoryItem::findOrFail($id);

            // Determinar el estado según la fecha programada
            $scheduledDate = Carbon::parse($validated['scheduled_date']);
            $today = Carbon::today();

            if ($scheduledDate->isFuture()) {
                $status = 'PROGRAMADO';
            } elseif ($scheduledDate->isPast()) {
                $status = 'VENCIDO';
            } else {
                $status = 'PROGRAMADO';
            }

            // Crear el registro de mantenimiento
            $maintenance = MaintenanceRecord::create([
                'inventory_item_id' => $inventoryItem->id,
                'maintenance_type' => $validated['maintenance_type'],
                'scheduled_date' => $validated['scheduled_date'],
                'actual_date' => now(),
                'technician_name' => $validated['technician_name'],
                'total_cost' => $validated['total_cost'] ?? 0,
                'work_description' => $validated['work_description'] ?? null,
                'maintenance_status' => $status,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mantenimiento registrado correctamente',
                'data' => [
                    'id' => $maintenance->id,
                    'maintenance_type' => $maintenance->maintenance_type,
                    'scheduled_date' => $maintenance->scheduled_date->format('d/m/Y'),
                    'technician_name' => $maintenance->technician_name,
                    'total_cost' => number_format($maintenance->total_cost, 2),
                    'maintenance_status' => $maintenance->maintenance_status,
                    'work_description' => $maintenance->work_description
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el mantenimiento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Completar un mantenimiento existente
     */
    public function completarMantenimiento(Request $request, $id)
    {
        try {
            // Buscar el registro de mantenimiento
            $maintenance = MaintenanceRecord::findOrFail($id);

            // Verificar que no esté ya completado
            if ($maintenance->maintenance_status === 'COMPLETADO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este mantenimiento ya está completado'
                ], 400);
            }

            // Actualizar el estado y la fecha de completado
            $maintenance->maintenance_status = 'COMPLETADO';
            $maintenance->completion_date = now();
            $maintenance->save();

            return response()->json([
                'success' => true,
                'message' => 'Mantenimiento completado correctamente',
                'data' => [
                    'id' => $maintenance->id,
                    'maintenance_status' => $maintenance->maintenance_status,
                    'completion_date' => $maintenance->completion_date->format('d/m/Y')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al completar el mantenimiento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar un nuevo uso del equipo (event_assignment)
     */
    public function registrarUso(Request $request, $id)
    {
        try {
            // Validar los datos
            $validated = $request->validate([
                'event_name' => 'required|string|max:255',
                'event_date' => 'required|date',
                'event_venue' => 'nullable|string|max:255',
                'hours_used' => 'nullable|numeric|min:0',
                'assignment_status' => 'nullable|in:ASIGNADO,EN_USO,DEVUELTO,CANCELADO',
                'notes' => 'nullable|string|max:1000'
            ]);

            // Buscar el InventoryItem
            $inventoryItem = InventoryItem::findOrFail($id);

            // Debug: Log del ID que se está usando
            \Log::info('Registrando uso para inventory_item_id: ' . $inventoryItem->id);

            // Crear el evento (simplificado - solo los campos básicos necesarios)
            $event = Event::create([
                'event_code' => 'EVT-' . strtoupper(Str::random(8)),
                'name' => $validated['event_name'],
                'start_date' => $validated['event_date'],
                'end_date' => $validated['event_date'], // Misma fecha por defecto
                'venue_address' => $validated['event_venue'] ?? 'Sin ubicación especificada',
                'status' => 'ACTIVO',
                'created_by' => auth()->id()
            ]);

            // Crear el registro de asignación con estado por defecto DEVUELTO (Finalizado)
            $assignment = EventAssignment::create([
                'event_id' => $event->id,
                'inventory_item_id' => $inventoryItem->id,
                'assigned_from' => $validated['event_date'],
                'assigned_until' => $validated['event_date'],
                'assignment_status' => $validated['assignment_status'] ?? 'DEVUELTO',
                'hours_used' => $validated['hours_used'] ?? null,
                'notes' => $validated['notes'] ?? null
            ]);

            // Debug: Log del assignment creado
            \Log::info('EventAssignment creado:', $assignment->toArray());

            // Cargar la relación del evento
            $assignment->load('event');

            return response()->json([
                'success' => true,
                'message' => 'Uso del equipo registrado correctamente',
                'data' => [
                    'id' => $assignment->id,
                    'event_name' => $assignment->event->name,
                    'event_date' => $assignment->event->start_date->format('d/m/Y'),
                    'venue_address' => $assignment->event->venue_address,
                    'hours_used' => $assignment->hours_used,
                    'assignment_status' => $assignment->assignment_status,
                    'notes' => $assignment->notes
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el uso del equipo: ' . $e->getMessage()
            ], 500);
        }
    }
         /**
     * Subir imagen a Cloudinary
     */
    public function uploadImage(Request $request, $id)
    {
        try {
            \Log::info('=== UPLOAD IMAGE DEBUG ===');
            \Log::info('Request ID (inventory_item_id): ' . $id);
            \Log::info('Has file: ' . ($request->hasFile('image') ? 'YES' : 'NO'));

            // Validar la imagen
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120' // max 5MB
            ]);

            // Buscar el InventoryItem (unidad específica)
            $inventoryItem = InventoryItem::findOrFail($id);
            \Log::info('InventoryItem found: ' . $inventoryItem->id);

            // Subir la imagen a Cloudinary usando el facade
            $uploadedFile = $request->file('image');
            \Log::info('Uploading to Cloudinary...');

            // Verificar si las credenciales están configuradas
            $cloudUrl = config('cloudinary.cloud_url');
            if (empty($cloudUrl) || strpos($cloudUrl, 'your_cloud_name') !== false || strpos($cloudUrl, 'your_api_key') !== false) {
                throw new \Exception('Credenciales de Cloudinary no configuradas. Por favor configura CLOUDINARY_URL en el archivo .env');
            }

            // Deshabilitar verificación SSL temporalmente para desarrollo en Windows/XAMPP
            // IMPORTANTE: Solo para ambiente local. En producción configura los certificados SSL correctamente.
            $previousVerifyPeer = null;
            $previousVerifyHost = null;
            if (config('app.env') === 'local' && strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $previousVerifyPeer = ini_get('curl.cainfo');
                $previousVerifyHost = ini_get('openssl.cafile');
                // Temporalmente deshabilitar verificación SSL
                \Cloudinary\Configuration\Configuration::instance()->url->secure(true);
            }

            try {
                // Configurar opciones de upload
                $uploadOptions = [
                    'folder' => 'inventory_items',
                    'resource_type' => 'image',
                ];

                $result = Cloudinary::upload(
                    $uploadedFile->getRealPath(),
                    $uploadOptions
                );
            } catch (\Exception $e) {
                // Si el error es de SSL, intentar con verificación deshabilitada
                if (strpos($e->getMessage(), 'SSL certificate') !== false || strpos($e->getMessage(), 'cURL error 60') !== false) {
                    \Log::warning('SSL certificate error detected, retrying with verification disabled for local development');

                    // Usar la API de Cloudinary directamente con opciones de Guzzle
                    $client = new \GuzzleHttp\Client([
                        'verify' => false, // Deshabilitar verificación SSL
                    ]);

                    // Construir la petición manualmente
                    $cloudName = env('CLOUDINARY_CLOUD_NAME');
                    $apiKey = env('CLOUDINARY_API_KEY');
                    $apiSecret = env('CLOUDINARY_API_SECRET');
                    $timestamp = time();

                    $params = [
                        'folder' => 'inventory_items',
                        'timestamp' => $timestamp,
                    ];

                    // Generar firma
                    $signature = $this->generateCloudinarySignature($params, $apiSecret);

                    $response = $client->request('POST', "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                        'multipart' => [
                            [
                                'name' => 'file',
                                'contents' => fopen($uploadedFile->getRealPath(), 'r'),
                                'filename' => $uploadedFile->getClientOriginalName(),
                            ],
                            ['name' => 'folder', 'contents' => 'inventory_items'],
                            ['name' => 'timestamp', 'contents' => $timestamp],
                            ['name' => 'api_key', 'contents' => $apiKey],
                            ['name' => 'signature', 'contents' => $signature],
                        ],
                    ]);

                    $result = json_decode($response->getBody()->getContents());
                } else {
                    throw $e;
                }
            }

            \Log::info('Cloudinary result: ' . json_encode($result));

            // Obtener el número de imágenes existentes para determinar el orden
            $order = $inventoryItem->images()->count();

            // Guardar en la base de datos
            // Manejar tanto objetos de Cloudinary como objetos stdClass del fallback manual
            $imageUrl = is_object($result) && method_exists($result, 'getSecurePath')
                ? $result->getSecurePath()
                : $result->secure_url;
            $publicId = is_object($result) && method_exists($result, 'getPublicId')
                ? $result->getPublicId()
                : $result->public_id;

            $image = ItemImage::create([
                'item_id' => $inventoryItem->id,
                'url' => $imageUrl,
                'public_id' => $publicId,
                'is_primary' => $order === 0, // La primera imagen es la principal
                'order' => $order
            ]);

            \Log::info('Image saved to DB: ' . $image->id);

            return response()->json([
                'success' => true,
                'message' => 'Imagen subida correctamente',
                'data' => [
                    'id' => $image->id,
                    'url' => $image->url,
                    'is_primary' => $image->is_primary,
                    'order' => $image->order
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Archivo inválido',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Upload error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al subir la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar firma de autenticación para Cloudinary
     */
    private function generateCloudinarySignature($params, $apiSecret)
    {
        // Ordenar parámetros alfabéticamente
        ksort($params);

        // Crear string de parámetros
        $paramString = '';
        foreach ($params as $key => $value) {
            if (!empty($value)) {
                $paramString .= $key . '=' . $value . '&';
            }
        }
        $paramString = rtrim($paramString, '&');

        // Generar firma SHA-1
        return sha1($paramString . $apiSecret);
    }

    /**
     * Eliminar imagen de Cloudinary y base de datos
     */
    public function deleteImage($itemId, $imageId)
    {
        try {
            // Buscar la imagen
            $image = ItemImage::where('item_id', $itemId)
                ->where('id', $imageId)
                ->firstOrFail();

            // Eliminar de Cloudinary
            \Cloudinary::destroy($image->public_id);

            // Eliminar de la base de datos
            $image->delete();

            // Si era la imagen principal, establecer otra como principal
            if ($image->is_primary) {
                $newPrimary = ItemImage::where('item_id', $itemId)
                    ->orderBy('order')
                    ->first();

                if ($newPrimary) {
                    $newPrimary->update(['is_primary' => true]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Imagen eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Establecer una imagen como principal
     */
    public function setPrimaryImage($itemId, $imageId)
    {
        try {
            // Desmarcar todas las imágenes como principal
            ItemImage::where('item_id', $itemId)
                ->update(['is_primary' => false]);

            // Marcar la nueva imagen como principal
            $image = ItemImage::where('item_id', $itemId)
                ->where('id', $imageId)
                ->firstOrFail();

            $image->update(['is_primary' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Imagen principal actualizada'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la imagen principal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir documento a Cloudinary
     */
    public function uploadDocument(Request $request, $id)
    {
        try {
            \Log::info('=== UPLOAD DOCUMENT DEBUG ===');
            \Log::info('Request ID (inventory_item_id): ' . $id);
            \Log::info('Has file: ' . ($request->hasFile('document') ? 'YES' : 'NO'));

            // Validar el documento
            $request->validate([
                'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,txt|max:10240', // max 10MB
                'document_type' => 'required|string|max:50',
                'name' => 'required|string|max:255',
                'notes' => 'nullable|string'
            ]);

            // Buscar el InventoryItem (unidad específica)
            $inventoryItem = InventoryItem::findOrFail($id);
            \Log::info('InventoryItem found: ' . $inventoryItem->id);

            // Subir el documento a Cloudinary
            $uploadedFile = $request->file('document');
            \Log::info('Uploading document to Cloudinary...');

            // Verificar si las credenciales están configuradas
            $cloudUrl = config('cloudinary.cloud_url');
            if (empty($cloudUrl) || strpos($cloudUrl, 'your_cloud_name') !== false || strpos($cloudUrl, 'your_api_key') !== false) {
                throw new \Exception('Credenciales de Cloudinary no configuradas. Por favor configura CLOUDINARY_URL en el archivo .env');
            }

            try {
                // Configurar opciones de upload para documentos (usar raw para PDFs y docs)
                $uploadOptions = [
                    'folder' => 'inventory_documents',
                    'resource_type' => 'raw', // Para documentos no-imagen
                ];

                $result = Cloudinary::upload(
                    $uploadedFile->getRealPath(),
                    $uploadOptions
                );
            } catch (\Exception $e) {
                // Si el error es de SSL, intentar con verificación deshabilitada
                if (strpos($e->getMessage(), 'SSL certificate') !== false || strpos($e->getMessage(), 'cURL error 60') !== false) {
                    \Log::warning('SSL certificate error detected, retrying with verification disabled for local development');

                    // Usar la API de Cloudinary directamente con opciones de Guzzle
                    $client = new \GuzzleHttp\Client([
                        'verify' => false, // Deshabilitar verificación SSL
                    ]);

                    // Construir la petición manualmente
                    $cloudName = env('CLOUDINARY_CLOUD_NAME');
                    $apiKey = env('CLOUDINARY_API_KEY');
                    $apiSecret = env('CLOUDINARY_API_SECRET');
                    $timestamp = time();

                    $params = [
                        'folder' => 'inventory_documents',
                        'timestamp' => $timestamp,
                    ];

                    // Generar firma
                    $signature = $this->generateCloudinarySignature($params, $apiSecret);

                    $response = $client->request('POST', "https://api.cloudinary.com/v1_1/{$cloudName}/raw/upload", [
                        'multipart' => [
                            [
                                'name' => 'file',
                                'contents' => fopen($uploadedFile->getRealPath(), 'r'),
                                'filename' => $uploadedFile->getClientOriginalName(),
                            ],
                            ['name' => 'folder', 'contents' => 'inventory_documents'],
                            ['name' => 'timestamp', 'contents' => $timestamp],
                            ['name' => 'api_key', 'contents' => $apiKey],
                            ['name' => 'signature', 'contents' => $signature],
                        ],
                    ]);

                    $result = json_decode($response->getBody()->getContents());
                } else {
                    throw $e;
                }
            }

            \Log::info('Cloudinary result: ' . json_encode($result));

            // Manejar tanto objetos de Cloudinary como objetos stdClass del fallback manual
            $documentUrl = is_object($result) && method_exists($result, 'getSecurePath')
                ? $result->getSecurePath()
                : $result->secure_url;
            $publicId = is_object($result) && method_exists($result, 'getPublicId')
                ? $result->getPublicId()
                : $result->public_id;

            // Guardar en la base de datos
            $document = InventoryItemDocument::create([
                'inventory_item_id' => $inventoryItem->id,
                'document_type' => $request->input('document_type'),
                'name' => $request->input('name'),
                'url' => $documentUrl,
                'public_id' => $publicId,
                'notes' => $request->input('notes'),
                'file_size' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType(),
                'uploaded_by' => auth()->id()
            ]);

            \Log::info('Document saved to DB: ' . $document->id);

            return response()->json([
                'success' => true,
                'message' => 'Documento subido correctamente',
                'data' => [
                    'id' => $document->id,
                    'name' => $document->name,
                    'document_type' => $document->document_type,
                    'url' => $document->url,
                    'file_size' => $document->file_size,
                    'mime_type' => $document->mime_type,
                    'notes' => $document->notes,
                    'created_at' => $document->created_at->format('d/m/Y H:i')
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Archivo inválido',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Upload error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar documento de Cloudinary y base de datos
     */
    public function deleteDocument($itemId, $documentId)
    {
        try {
            // Buscar el documento
            $document = InventoryItemDocument::where('inventory_item_id', $itemId)
                ->where('id', $documentId)
                ->firstOrFail();

            // Eliminar de Cloudinary con resource_type raw
            try {
                \Cloudinary::destroy($document->public_id, ['resource_type' => 'raw']);
            } catch (\Exception $e) {
                \Log::warning('Error deleting from Cloudinary (continuing): ' . $e->getMessage());
                // Continuar aunque falle Cloudinary
            }

            // Eliminar de la base de datos
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Delete document error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el documento: ' . $e->getMessage()
            ], 500);
        }
    }
}
