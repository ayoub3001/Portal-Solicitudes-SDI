<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class RequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'date'         => $this->date?->toDateString(),
            'status'       => $this->status,
            'document_path'=> $this->document_path,
            'document_url' => $this->document_path
                ? Storage::url($this->document_path)
                : null,
            'signature_path' => $this->signature_path,
            'signature_url'  => $this->signature_path
                ? Storage::url($this->signature_path)
                : null,
            'signed_at'    => $this->signed_at,
            'created_at'   => $this->created_at,
            'user'         => $this->whenLoaded('user'),
        ];
    }
}
