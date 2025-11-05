<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\ItemParent;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Location;
use App\Models\EventAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Str;

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

            // ubicación: puedes mandar id o nombre
            'location'            => [$isDraft ? 'nullable' : 'nullable','string','max:255'],

            'unit_set'            => [$isDraft ? 'nullable' : 'required','in:UNIT,SET'],
            'rack_position'       => ['nullable','string','max:50'],
            'panel_position'      => ['nullable','string','max:50'],
            'rfid_tag'            => ['nullable','string','max:50'],
            'serial_number'       => ['nullable','string','max:100'],

            // aceptamos texto y normalizamos
            'status'              => [$isDraft ? 'nullable' : 'required','string','max:30'],
            'condition'           => ['nullable','in:EXCELENTE,BUENO,REGULAR,MALO'],

            'original_price'      => ['nullable','numeric','min:0'],
            'ideal_rental_price'  => ['nullable','numeric','min:0'],
            'minimum_rental_price'=> ['nullable','numeric','min:0'],
            'warranty_valid'      => ['boolean'],
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
            // Para borradores, status puede ser null
            $status = null;
            $statusIn = (string) $request->input('status');

            if ($statusIn !== '') {
                $status = strtoupper(str_replace(' ', '_', Str::ascii($statusIn)));
                $validStatuses = ['ACTIVO','INACTIVO','DESCOMPUESTO','EN_REPARACION','EXTRAVIADO','BAJA'];
                if (!in_array($status, $validStatuses, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status inválido.'
                    ], 422);
                }
            } elseif (!$isDraft) {
                // Si NO es borrador, el status es obligatorio
                return response()->json([
                    'success' => false,
                    'message' => 'El status es obligatorio.'
                ], 422);
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
                'item_parent_id'       => $parent->id,
                'location_id'          => $locationId,
                'unit_set'             => (string) $request->input('unit_set', 'UNIT'),
                'rack_position'        => (string) $request->input('rack_position', ''),
                'panel_position'       => (string) $request->input('panel_position', ''),
                'rfid_tag'             => (string) $request->input('rfid_tag', ''),
                'serial_number'        => (string) $request->input('serial_number', ''),
                'status'               => $status ?: ($isDraft ? null : 'ACTIVO'),
                'condition'            => (string) $request->input('condition', 'BUENO'),
                'original_price'       => $request->input('original_price', 0),
                'ideal_rental_price'   => $request->input('ideal_rental_price', 0),
                'minimum_rental_price' => $request->input('minimum_rental_price', 0),
                'warranty_valid'       => (bool) $request->boolean('warranty_valid', false),
                'is_active'            => true,
                'is_draft'             => $isDraft,
                'created_by'           => auth()->id() ?? 1,
            ]);

            // 6) Respuesta formateada para tu grilla (lo mismo que espera tu front)
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
            'location'            => ['nullable','string','max:255'],
            'unit_set'            => [$isDraft ? 'nullable' : 'required','in:UNIT,SET'],
            'rack_position'       => ['nullable','string','max:50'],
            'panel_position'      => ['nullable','string','max:50'],
            'rfid_tag'            => ['nullable','string','max:50'],
            'serial_number'       => ['nullable','string','max:100'],
            'status'              => [$isDraft ? 'nullable' : 'required','string','max:30'],
            'condition'           => ['nullable','in:EXCELENTE,BUENO,REGULAR,MALO'],
            'original_price'      => ['nullable','numeric','min:0'],
            'ideal_rental_price'  => ['nullable','numeric','min:0'],
            'minimum_rental_price'=> ['nullable','numeric','min:0'],
            'warranty_valid'      => ['boolean'],
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
                $validStatuses = ['ACTIVO','INACTIVO','DESCOMPUESTO','EN_REPARACION','EXTRAVIADO','BAJA'];
                if (!in_array($status, $validStatuses, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status inválido.'
                    ], 422);
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
            if ($locationId) {
                $updateData['location_id'] = $locationId;
            }
            if ($request->filled('unit_set')) {
                $updateData['unit_set'] = (string) $request->input('unit_set');
            }
            if ($request->filled('rack_position')) {
                $updateData['rack_position'] = (string) $request->input('rack_position');
            }
            if ($request->filled('panel_position')) {
                $updateData['panel_position'] = (string) $request->input('panel_position');
            }
            if ($request->filled('rfid_tag')) {
                $updateData['rfid_tag'] = (string) $request->input('rfid_tag');
            }
            if ($request->filled('serial_number')) {
                $updateData['serial_number'] = (string) $request->input('serial_number');
            }
            if ($status) {
                $updateData['status'] = $status;
            }
            if ($request->filled('condition')) {
                $updateData['condition'] = (string) $request->input('condition');
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

            $inventoryItem->update($updateData);

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
            ->whereNotIn('assignment_status', ['DEVUELTO', 'CANCELADO'])
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
        $mode = 'new';

        if ($id) {
            $itemParent = ItemParent::with([
                'category',
                'brand',
                'items.location'
            ])->findOrFail($id);

            // Detectar modo: edit (editar parent) o new-from-parent (crear nueva unidad)
            $queryMode = request()->query('mode');
            if ($queryMode === 'new-from-parent') {
                $mode = 'new-from-parent';
            } else {
                $mode = 'edit';
            }
        }

        return view('inventory.formulario', compact('itemParent', 'mode'));
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
            'location'
        ])->findOrFail($id);

        // Usar el parent del item
        $itemParent = $inventoryItem->parent;

        // Calcular disponibilidad actual del parent
        $availability = $this->calculateRealAvailability($itemParent, now()->format('Y-m-d'));

        return view('inventory.detalle', compact('itemParent', 'availability', 'inventoryItem'));
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
                    ->whereNotIn('assignment_status', ['DEVUELTO', 'CANCELADO'])
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
}
