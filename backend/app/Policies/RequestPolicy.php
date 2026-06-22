<?php

namespace App\Policies;

use App\Models\RequestM;
use App\Models\User;

class RequestPolicy
{
    /**
     * Ver detalle: admin ve todo, user solo la suya
     */
    public function view(User $user, RequestM $requestM): bool
    {
        return $user->role === 'admin' || $requestM->user_id === $user->id;
    }

    /**
     * Editar: solo el dueño, solo si está pending
     */
    public function update(User $user, RequestM $requestM): bool
    {
        return $requestM->user_id === $user->id
            && $requestM->status === 'pending';
    }

    /**
     * Firmar: solo el dueño, solo si está pending
     */
    public function sign(User $user, RequestM $requestM): bool
    {
        return $requestM->user_id === $user->id
            && $requestM->status === 'pending';
    }

    /**
     * Aprobar/rechazar: solo admin, solo si está signed
     */
    public function approve(User $user, RequestM $requestM): bool
    {
        return $user->role === 'admin'
            && $requestM->status === 'signed';
    }
}