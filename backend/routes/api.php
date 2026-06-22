<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestMController;


Route::group(['middleware' => 'log.activity'], function () {
    // Login
    Route::post('auth/login', [AuthController::class, 'login']);
    
    Route::group(['middleware' => 'auth:api'], function () {
        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/refresh', [AuthController::class, 'refresh']);
        
        // Requests - accesibles por todos los usuarios autenticados
        Route::get('requests', [RequestMController::class, 'index']);
        Route::post('requests', [RequestMController::class, 'store']);
        Route::get('requests/{requestM}', [RequestMController::class, 'show']);
        Route::put('requests/{requestM}', [RequestMController::class, 'update']);
        
        // Firma - solo el dueño (la policy lo controla)
        Route::post('requests/{requestM}/signature', [RequestMController::class, 'signature']);
        
        // Aprobar/rechazar - solo admin
        Route::group(['middleware' => 'role:admin'], function () {
            Route::post('requests/{requestM}/approve', [RequestMController::class, 'approve']);
            Route::post('requests/{requestM}/reject',  [RequestMController::class, 'reject']);
        }); 
    });
});