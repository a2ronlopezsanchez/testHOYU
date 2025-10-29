<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function index()
    {
        return view('brands');
    }

    // Endpoint server-side para DataTables
    public function list(Request $request)
    {
        $draw   = (int) $request->input('draw');
        $start  = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $search = $request->input('search.value');

        $query = Brand::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        $recordsTotal    = Brand::count();
        $recordsFiltered = (clone $query)->count();

        // Orden
        $orderColIndex = (int) $request->input('order.0.column', 1);
        $orderDir      = $request->input('order.0.dir', 'asc');
        $columns       = [
            0 => 'code',
            1 => 'name',
            2 => 'full_name',
            3 => 'website',
            4 => 'support_email',
            5 => 'support_phone',
            6 => 'is_active',
        ];
        $orderBy = $columns[$orderColIndex] ?? 'name';

        $data = $query
            ->orderBy($orderBy, $orderDir)
            ->skip($start)
            ->take($length)
            ->get()
            ->map(function ($b) {
                return [
                    'id'             => $b->id,
                    'code'           => $b->code,
                    'name'           => $b->name,
                    'full_name'      => $b->full_name,
                    'website'        => $b->website,
                    'support_email'  => $b->support_email,
                    'support_phone'  => $b->support_phone,
                    'is_active'      => $b->is_active ? 'Activo' : 'Inactivo',
                ];
            });

        return response()->json([
            'draw'            => $draw,
            'recordsTotal'    => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data'            => $data,
        ]);
    }

    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'           => ['nullable','string','max:50', Rule::unique('brands','code')],
            'name'           => ['required','string','max:120'],
            'full_name'      => ['nullable','string','max:180'],
            'website'        => ['nullable','string','max:255'],
            'support_email'  => ['nullable','email','max:120'],
            'support_phone'  => ['nullable','string','max:40'],
            'logo_url'       => ['nullable','string','max:255'],
            'is_active'      => ['required','boolean'],
        ]);

        // Normaliza website (agrega https:// si no trae esquema)
        if (!empty($data['website']) && !preg_match('~^https?://~i', $data['website'])) {
            $data['website'] = 'https://' . $data['website'];
        }

        $brand = Brand::create($data);

        return response()->json(['message' => 'Marca creada', 'id' => $brand->id], 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $request->validate([
            'code'           => ['nullable','string','max:50', Rule::unique('brands','code')->ignore($brand->id)],
            'name'           => ['required','string','max:120'],
            'full_name'      => ['nullable','string','max:180'],
            'website'        => ['nullable','string','max:255'],
            'support_email'  => ['nullable','email','max:120'],
            'support_phone'  => ['nullable','string','max:40'],
            'logo_url'       => ['nullable','string','max:255'],
            'is_active'      => ['required','boolean'],
        ]);

        if (!empty($data['website']) && !preg_match('~^https?://~i', $data['website'])) {
            $data['website'] = 'https://' . $data['website'];
        }

        $brand->update($data);

        return response()->json(['message' => 'Marca actualizada']);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete(); // hard delete (si quieres SoftDeletes, te digo qué cambiar)
        return response()->json(['message' => 'Marca eliminada']);
    }
}
