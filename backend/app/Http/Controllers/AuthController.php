<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $user = JWTAuth::user();

        if ($user->status === 'inactive') {
            JWTAuth::setToken($token)->invalidate();
            return response()->json(['error' => 'Usuario inactivo'], 403);
        }
        
        return $this->responseWithToken($token, $user);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Something went wrong when logging out'], 500);
        }
    }

    public function me()
    {
        return new UserResource(auth('api')->user());
    }

    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            $user = JWTAuth::setToken($newToken)->toUser();
            return $this->responseWithToken($newToken, $user);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Could not refresh token'], 401);
        }
    }

    private function responseWithToken($token, $user)
    {
        return response()->json([
            'access_token' => $token,
            'user' => new UserResource($user),
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60
        ]);
    }
}
