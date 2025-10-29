<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Carbon\Carbon;
use DB;
use App\Mail\ResetMail;
use Illuminate\Support\Facades\Mail;
use Auth;
use Twilio\Rest\Client;
use Twilio\Exceptions;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function reset_password(Request $request){
        $validation = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'telefono' => 'required|digits:10',

        ],[
            'email.required' => "El campo email es requerido",
            'email.email' => "El email debe ser un correo valido",
            'email.exists' => "El email no esta registrado en nuestra base de datos",
            'telefono.required' => "El campo telefono es requerido",
            'telefono.required' => "El número de teléfono debe tener exactamente 10 dígitos.",

        ]);
        if( $validation->fails() )
        {
            return redirect()->back()
            ->withErrors( $validation->errors() )
            ->withInput();
        } 
        $user = User::where("email",$request->email)->first();

        date_default_timezone_set('Etc/GMT+6');
        $expiresAt = Carbon::now()->addHour();
        $code = mt_rand(100000, 999999);
        // Verificar si ya existe un registro para este correo
        $existingReset = DB::table('password_resets')->where('email', $request->email)->first();

        if ($existingReset) {
            // Actualizar el registro existente
            DB::table('password_resets')->where('email', $request->email)->update([
                'token' => $code,
                'expires_at' => $expiresAt,
                'created_at' => now(),
            ]);
        }else{
            DB::table('password_resets')->insert([
                'email' => $request->email,
                'token' => $code,
                'expires_at' => $expiresAt,
                'created_at' => now()
                ]); 
        }
 
        $details = [
            'name' => $user->name,
            'email' => $request->email,
            'token' => $code
        ];
        
       


        return redirect()->route('verificacion', ['email' => $request->email]);

    }
    public function verificacion(Request $request)
    {
        $email = $request->email;
        return view('auth/validation-code',compact('email'));
    }
    public function verifyToken(Request $request){
        $validation = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ],[
            'email.required' => "El campo email es requerido",
            'email.email' => "El email debe ser un correo valido",
            'email.exists' => "El email no esta registrado en nuestra base de datos",
        ]);
        if( $validation->fails() )
        {
            return redirect()->back()
            ->withErrors( $validation->errors() )
            ->withInput();
        } 
        // Obtener el arreglo de los valores de los inputs de token
        $tokenParts = $request->input('token'); // Esto devolverá un array con cada dígito del token

        // Unir los dígitos en un solo string
        $token = implode('', $tokenParts);

        // Validar que el token tiene 6 dígitos
        if (strlen($token) != 6) {
            return redirect()->back()
            ->withErrors(['token' => 'El código de verificación debe tener 6 dígitos.'])
            ->withInput();
        }

        $resetRequest = DB::table('password_resets')
                  ->where('email', $request->email)
                  ->where('token', $token)
                  ->first();
                  
                  
        date_default_timezone_set('Etc/GMT+6');

        if ($resetRequest && Carbon::now()->lessThan($resetRequest->expires_at)) {
            // El código es válido
            return redirect()->route('changePassword', ['email' => $request->email]);

        } else {
            return redirect()->back()
            ->withErrors(['token' => 'El código de verificación no es valido o ha caducado.'])
            ->withInput();
            // El código ha expirado o no es válido
        }
            
    }
    public function changePassword(Request $request)
    {
        $email = $request->email;
        return view('auth/changePassword',compact('email'));
    }
    public function newPassword(Request $request)
    {
        $validation = Validator::make($request->all(), [
            'password' => ['required', 'string', 'min:6', 'confirmed']
        ],[
            'password.required' => "El campo contraseña es requerido",
            'password.string' => "La contraseña debe ser texto",
            'password.min' => "La contraseña debe contener por lo menos 6 caracteres",
            'password.confirmed' => "La contraseña y confirmacion no coinciden"
        ]);

        if( $validation->fails() )
        {
            return redirect()->back()
            ->withErrors( $validation->errors() )
            ->withInput();
        } 
         // Obtener al usuario por su correo o ID
        $user = User::where('email', $request->email)->first();

        // Actualizar la contraseña del usuario
        $user->password = bcrypt($request->password);
        $user->save();

        // Borrar el registro del token para recuperar la contraseña
        DB::table('password_resets')->where('email', $request->email)->delete();

        // Iniciar sesión automáticamente al usuario
        Auth::login($user);
        return redirect()->route('login');

    }
}
