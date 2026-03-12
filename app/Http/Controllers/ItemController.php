<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventoryItem;

class ItemController extends Controller
{
    public function index()
    {
        $items = InventoryItem::query()
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
            ])
            ->orderBy('sku')
            ->simplePaginate(25)
            ->withQueryString();

        return view('catalogo',compact('items'));
    }
}
