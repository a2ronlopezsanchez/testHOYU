<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            1 => 'sku',
            2 => 'name',
            4 => 'item_id',
        ];

        $orderColumnIndex = (int) data_get($request->input('order'), '0.column', 1);
        $orderDirection = strtolower((string) data_get($request->input('order'), '0.dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $orderColumn = $columnsMap[$orderColumnIndex] ?? 'sku';

        $baseQuery = InventoryItem::query()
            ->select([
                'id',
                'sku',
                'name',
                'item_id',
                'is_active',
                'item_parent_id',
            ])
            ->with([
                'parent:id,category_id',
                'parent.category:id,name',
            ]);

        $filteredQuery = (clone $baseQuery)
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery
                        ->where('sku', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('item_id', 'like', "%{$search}%")
                        ->orWhereHas('parent.category', function (Builder $categoryQuery) use ($search): void {
                            $categoryQuery->where('name', 'like', "%{$search}%");
                        });
                });
            });

        $recordsTotal = InventoryItem::query()->count();
        $recordsFiltered = (clone $filteredQuery)->count();

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
                'category' => $item->parent?->category?->name,
                'item_id' => $item->item_id,
                'is_active' => (bool) $item->is_active,
                'view_url' => route('inventory.detalle.unidad', ['id' => $item->id]),
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

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'SKU eliminado correctamente.',
        ]);
    }

}
