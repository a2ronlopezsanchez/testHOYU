<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
     public function index()
    {
        return view('category');
    }

    // Endpoint server-side para DataTables
    public function list(Request $request)
    {
        $draw   = (int) $request->input('draw');
        $start  = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $search = $request->input('search.value');

        $query = Category::query();

        // Búsqueda por nombre (puedes añadir code/description si quieres)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $recordsTotal    = Category::count();
        $recordsFiltered = (clone $query)->count();

        // Orden (DataTables manda columnas y dir)
        $orderColIndex = $request->input('order.0.column', 1); // por defecto name
        $orderDir      = $request->input('order.0.dir', 'asc');
        $columns       = [
            0 => 'code',
            1 => 'name',
            2 => 'description',
            3 => 'is_active',
            4 => 'sort_order',
        ];
        $orderBy = $columns[$orderColIndex] ?? 'name';

        $data = $query
            ->orderBy($orderBy, $orderDir)
            ->skip($start)
            ->take($length)
            ->get()
            ->map(function ($c) {
                return [
                    'id'          => $c->id,
                    'code'        => $c->code,
                    'name'        => $c->name,
                    'description' => $c->description,
                    'is_active'   => $c->is_active ? 'Activo' : 'Inactivo',
                    'sort_order'  => $c->sort_order,
                ];
            });

        return response()->json([
            'draw'            => $draw,
            'recordsTotal'    => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data'            => $data,
        ]);
    }

    public function show(Category $category)
    {
        return response()->json($category);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'        => ['nullable', 'string', 'max:50', 'unique:categories,code'],
            'name'        => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'icon'        => ['nullable', 'string', 'max:120'],
            'color'       => ['nullable', 'string', 'max:30'],
            'sort_order'  => ['nullable', 'integer'],
            'is_active'   => ['required', 'boolean'],
        ]);
        // Auto-generar code si no viene en el request
        if (empty($data['code'])) {
            $data['code'] = $this->generateUniqueCode($data['name'], 'categories');
        }
        $cat = Category::create($data);

        return response()->json(['message' => 'Categoría creada', 'id' => $cat->id], 201);
    }
    /**
     * Genera un code único basado en el nombre
     * Intenta con 1 letra, luego 2, luego 3, etc.
     *
     * @param string $name Nombre de la categoría/marca
     * @param string $table Nombre de la tabla para verificar unicidad
     * @return string Code único generado
     */
    private function generateUniqueCode(string $name, string $table): string
    {
        // Limpiar el nombre: solo letras y espacios, en mayúsculas
        $cleanName = strtoupper(preg_replace('/[^A-Za-zÑñ\s]/', '', $name));
        $cleanName = trim($cleanName);

        if (empty($cleanName)) {
            // Fallback si el nombre no tiene letras
            return 'X' . rand(1000, 9999);
        }

        // Intentar con longitudes incrementales: 1, 2, 3...
        $maxLength = min(strlen($cleanName), 10); // máximo 10 caracteres

        for ($length = 1; $length <= $maxLength; $length++) {
            $candidate = substr($cleanName, 0, $length);

            // Verificar si este code ya existe
            $exists = \DB::table($table)
                ->where('code', $candidate)
                ->whereNull('deleted_at') // ignorar soft deleted
                ->exists();

            if (!$exists) {
                return $candidate;
            }
        }

        // Si llegamos aquí, incluso el nombre completo está ocupado
        // Agregar un número al final
        $baseName = substr($cleanName, 0, $maxLength);
        $counter = 1;

        while ($counter < 1000) {
            $candidate = $baseName . $counter;
            $exists = \DB::table($table)
                ->where('code', $candidate)
                ->whereNull('deleted_at')
                ->exists();

            if (!$exists) {
                return $candidate;
            }
            $counter++;
        }

        // Último recurso: timestamp
        return $baseName . time();
    }
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'code'        => ['nullable', 'string', 'max:50', Rule::unique('categories', 'code')->ignore($category->id)],
            'name'        => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'icon'        => ['nullable', 'string', 'max:120'],
            'color'       => ['nullable', 'string', 'max:30'],
            'sort_order'  => ['nullable', 'integer'],
            'is_active'   => ['required', 'boolean'],
        ]);

        $category->update($data);

        return response()->json(['message' => 'Categoría actualizada']);
    }

    public function destroy(Category $category)
    {
        $category->delete(); // SoftDeletes
        return response()->json(['message' => 'Categoría eliminada']);
    }
}
