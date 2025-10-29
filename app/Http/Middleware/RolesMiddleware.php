<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Auth;
use Illuminate\Support\Facades\URL;

class RolesMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next,...$role)
    {
        //URL::forceScheme('https');
        if (request()->ip() !== '127.0.0.1') {
            URL::forceScheme('https');
        }
        if(!$request->user()->hasAnyRole($role)){
            $roles = $request->user()->getRoleNames();
            switch($roles[0]){
                case 'SuperAdministrador':
                    return redirect()->route('dashboard');
                    break;
                
                default:
                    Auth::logout();
                    return redirect('login');
                    break;
            }
        }
        return $next($request);
    }
}
