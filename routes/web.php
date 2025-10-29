<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
//Estas rutas se van a quitar son solo para no perder los avances
Route::get('/test', function () {
    return view('test/dashboard');
})->name('test_dashboard');
Route::get('/test/espectaculares', function () {
    return view('test/spectacular');
})->name('test_espectaculares');

Route::post('/reset_password', [App\Http\Controllers\UserController::class, 'reset_password'])->name('reset_password');
Route::get('/verificacion', [App\Http\Controllers\UserController::class,  'verificacion'])->name('verificacion');
Route::post('/verifyToken', [App\Http\Controllers\UserController::class, 'verifyToken'])->name('verifyToken');
Route::get('/changePassword', [App\Http\Controllers\UserController::class,  'changePassword'])->name('changePassword');
Route::post('/newPassword', [App\Http\Controllers\UserController::class,  'newPassword'])->name('newPassword');

Route::post('/logout', function () {
    Auth::logout();
    return redirect('/login');
})->name('logout');
Route::get('/logout', function () {
    Auth::logout();
    return redirect('/login');
})->name('logout');

Route::middleware('auth')->group(function () {
    Route::group(["middleware" => "role:Superadministrador"],function(){
        Route::get('/', function () {
            return view('index');
        })->name('dashboard');
        //Marcas
        Route::prefix('brands')->name('brands.')->group(function () {
            Route::get('/', [App\Http\Controllers\BrandController::class, 'index'])->name('index');           // Vista
            Route::get('/list', [App\Http\Controllers\BrandController::class, 'list'])->name('list');        // JSON DataTables (server-side)
            Route::get('/{brand}', [App\Http\Controllers\BrandController::class, 'show'])->name('show');     // Obtener 1 (editar)
            Route::post('/', [App\Http\Controllers\BrandController::class, 'store'])->name('store');         // Crear
            Route::put('/{brand}', [App\Http\Controllers\BrandController::class, 'update'])->name('update'); // Actualizar
            Route::delete('/{brand}', [App\Http\Controllers\BrandController::class, 'destroy'])->name('destroy'); // Eliminar
        });
        //Categorias
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [App\Http\Controllers\CategoryController::class, 'index'])->name('index');           // Vista
            Route::get('/list', [App\Http\Controllers\CategoryController::class, 'list'])->name('list');        // JSON DataTables (server-side)
            Route::get('/{category}', [App\Http\Controllers\CategoryController::class, 'show'])->name('show');  // Obtener 1 (para editar)
            Route::post('/', [App\Http\Controllers\CategoryController::class, 'store'])->name('store');         // Crear
            Route::put('/{category}', [App\Http\Controllers\CategoryController::class, 'update'])->name('update'); // Actualizar
            Route::delete('/{category}', [App\Http\Controllers\CategoryController::class, 'destroy'])->name('destroy'); // Eliminar (SoftDelete)
        });
            // CRUD principal
        Route::get('inventory/items', [App\Http\Controllers\InventoryController::class, 'getInventoryItems']);
        Route::post('inventory/item-parents', [App\Http\Controllers\InventoryController::class, 'storeParent'])
                ->name('inventory.parents.store');
        Route::get('inventory/lookups', [App\Http\Controllers\InventoryController::class, 'lookups'])
                ->name('inventory.lookups');
        Route::get('inventory/item-parents', [App\Http\Controllers\InventoryController::class, 'parentsList'])
            ->name('inventory.parents.index');
        Route::get('inventory/item-parents/{parent}/next-id', [App\Http\Controllers\InventoryController::class, 'nextIdForParent'])
            ->name('inventory.parents.nextId');
        Route::get('inventory/item-parents/{parent}/items', [App\Http\Controllers\InventoryController::class, 'itemsByParent'])
            ->name('inventory.parents.items');
        // Disponibilidad de inventario
        Route::get('inventory/availability/{itemParentId}', [App\Http\Controllers\InventoryController::class, 'getItemAvailability'])
            ->name('inventory.availability.item');

        Route::post('inventory/availability/bulk', [App\Http\Controllers\InventoryController::class, 'getBulkAvailability'])
            ->name('inventory.availability.bulk');

        Route::get('inventory/units/{itemParentId}/details', [App\Http\Controllers\InventoryController::class, 'getUnitDetails'])
            ->name('inventory.units.details');

        Route::post('inventory/items', [App\Http\Controllers\InventoryController::class, 'store']);
        Route::get('inventory/items/{itemParentId}', [App\Http\Controllers\InventoryController::class, 'getItemDetails']);
        Route::put('inventory/items/{itemParentId}', [App\Http\Controllers\InventoryController::class, 'update']);
        Route::delete('inventory/items/{itemParentId}', [App\Http\Controllers\InventoryController::class, 'destroy']);
        
        // Configuraciones y filtros
        Route::get('inventory/categories', [App\Http\Controllers\InventoryController::class, 'getCategories']);
        Route::get('inventory/brands', [App\Http\Controllers\InventoryController::class, 'getBrands']);
        Route::get('inventory/locations', [App\Http\Controllers\InventoryController::class, 'getLocations']);
        
        // Dashboard y estadísticas
        Route::get('inventory/dashboard/stats', [App\Http\Controllers\InventoryController::class, 'getDashboardStats']);

        Route::get('/catalogo', [App\Http\Controllers\ItemController::class,  'index'])->name('catalogo');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});

require __DIR__.'/auth.php';
