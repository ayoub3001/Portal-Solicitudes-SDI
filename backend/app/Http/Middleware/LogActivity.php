<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class LogActivity
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        if ($request->is('api/*') && config('logging.activity.enabled')) {
            $this->logRequest($request, $response);
        }

        return $response;
    }

    private function logRequest(Request $request, $response): void
    {
        try {
            DB::connection('mongodb')
                ->getDatabase()
                ->selectCollection('activity_logs')
                ->insertOne([
                    'user_id'    => optional($request->user())->id,
                    'user_email' => optional($request->user())->email,
                    'method'     => $request->method(),
                    'path'       => $request->path(),
                    'ip'         => $request->ip(),
                    'status'     => $response->getStatusCode(),
                    'created_at' => now()->toDateTimeString(),
                ]);
        } catch (Throwable $e) {
            Log::warning('No se pudo registrar actividad en MongoDB', [
                'path' => $request->path(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}