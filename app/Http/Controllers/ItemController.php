<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ItemController extends Controller
{
    public function index()
    {
        return view('catalogo');
    }

    public function data(Request $request): JsonResponse
    {
        $length = max(10, min((int) $request->integer('length', 25), 100));
        $start = max(0, (int) $request->integer('start', 0));
        $draw = (int) $request->integer('draw', 1);
        $search = trim((string) data_get($request->input('search'), 'value', ''));

        $columnsMap = [
            1 => 'units.sku',
            2 => 'units.name',
            4 => 'units.item_id',
        ];

        $orderColumnIndex = (int) data_get($request->input('order'), '0.column', 1);
        $orderDirection = strtolower((string) data_get($request->input('order'), '0.dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $orderColumn = $columnsMap[$orderColumnIndex] ?? 'units.sku';

        $baseQuery = InventoryItem::query()
            ->from('units')
            ->leftJoin('items', 'items.id', '=', 'units.item_parent_id')
            ->leftJoin('categories', 'categories.id', '=', 'items.category_id')
            ->select([
                'units.id',
                'units.sku',
                'units.name',
                'units.item_id',
                'units.is_active',
                'units.item_parent_id',
                'categories.name as category_name',
            ]);

        $filteredQuery = (clone $baseQuery)
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery
                        ->where('units.sku', 'like', "%{$search}%")
                        ->orWhere('units.name', 'like', "%{$search}%")
                        ->orWhere('units.item_id', 'like', "%{$search}%")
                        ->orWhere('categories.name', 'like', "%{$search}%");
                });
            });

        $recordsTotal = Cache::remember('catalogo_records_total', now()->addMinutes(10), static function (): int {
            return (int) InventoryItem::query()->count();
        });
        $recordsFiltered = (clone $filteredQuery)->count('units.id');

        $items = $filteredQuery
            ->orderBy($orderColumn, $orderDirection)
            ->offset($start)
            ->limit($length)
            ->get();

        $data = $items->map(function (InventoryItem $item): array {
            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'category' => $item->category_name,
                'item_id' => $item->item_id,
                'is_active' => (bool) $item->is_active,
                'view_url' => route('inventory.detalle.unidad', ['id' => $item->id]),
                'edit_url' => route('inventory.formulario', ['id' => $item->item_parent_id]) . '?mode=edit-unit&unit_id=' . $item->id,
            ];
        });

        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ]);
    }

    public function toggleActive(Request $request, InventoryItem $item): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $item->update([
            'is_active' => (bool) $validated['is_active'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente.',
            'data' => [
                'id' => $item->id,
                'is_active' => (bool) $item->is_active,
            ],
        ]);
    }


    public function destroy(InventoryItem $item): JsonResponse
    {
        abort_unless(auth()->user()?->hasRole('Superadministrador'), 403);

        $item->update([
            'item_id' => 'DEL' . $item->id,
        ]);

        $item->delete();
        Cache::forget('catalogo_records_total');

        return response()->json([
            'success' => true,
            'message' => 'SKU eliminado correctamente.',
        ]);
    }

}
