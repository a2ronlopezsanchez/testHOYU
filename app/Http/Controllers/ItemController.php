<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventoryItem;

class ItemController extends Controller
{
    public function index()
    {
        $items = InventoryItem::with([
            'parent.category',   // ← viene del padre
            'parent.brand',      // ← viene del padre
            'location',          // ← sigue en el hijo
        ])
        ->orderBy('sku')
        ->get();
        return view('catalogo',compact('items'));
    }
}
