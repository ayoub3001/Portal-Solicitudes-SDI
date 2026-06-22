<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignatureRequest;
use App\Http\Requests\SolicitudRequest;
use App\Models\RequestM;
use Illuminate\Http\Request;
use App\Http\Resources\RequestResource;
use Illuminate\Support\Facades\Storage;

class RequestMController extends Controller
{
    /**
     * GET /api/requests
     * - Admin: ve todas
     * - User: solo las suyas
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $requests = $user->role === 'admin'
            ? RequestM::with('user')->orderByDesc('date')->get()
            : RequestM::where('user_id', $user->id)->orderByDesc('date')->get();

        return RequestResource::collection($requests);
    }

    /**
     * POST /api/requests
     */
    public function store(SolicitudRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        if ($request->hasFile('document')) {
            $data['document_path'] = $this->storeDocument($request->file('document'));
        }

        unset($data['document']);

        $req = RequestM::create($data);

        return new RequestResource($req);
    }

    /**
     * PUT /api/requests/{id}
     */
    public function update(SolicitudRequest $request, RequestM $requestM)
    {
        $this->authorize('update', $requestM);

        $data = $request->validated();

        if ($request->hasFile('document')) {
            $this->deleteDocument($requestM->document_path);
            $data['document_path'] = $this->storeDocument($request->file('document'));
        }

        unset($data['document']);

        $requestM->update($data);

        return new RequestResource($requestM->load('user'));
    }

    /**
     * GET /api/requests/{id}
     */
    public function show(RequestM $requestM)
    {
        $this->authorize('view', $requestM);

        return new RequestResource($requestM->load('user'));
    }

    /**
     * POST /api/requests/{id}/signature
     */
    public function signature(SignatureRequest $request, RequestM $requestM)
    {
        $this->authorize('sign', $requestM);

        $requestM->update([
            'signature_path' => $this->storeSignature($request),
            'signed_at'      => now(),
            'status'         => 'signed',
        ]);

        return new RequestResource($requestM);
    }

    /**
     * POST /api/requests/{id}/approve
     */
    public function approve(RequestM $requestM)
    {
        $this->authorize('approve', $requestM);

        $requestM->update(['status' => 'approved']);

        return new RequestResource($requestM);
    }

    /**
     * POST /api/requests/{id}/reject
     */
    public function reject(RequestM $requestM)
    {
        $this->authorize('approve', $requestM); // misma policy

        $requestM->update(['status' => 'rejected']);

        return new RequestResource($requestM);
    }

    private function storeDocument($file): string
    {
        return $file->store('requests/documents', 'public');
    }

    private function deleteDocument(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    private function storeSignature(SignatureRequest $request): string
    {
        if ($request->hasFile('signature')) {
            return $request->file('signature')->store('signatures', 'public');
        }

        $image = $request->input('signature');
        $image = preg_replace('/^data:image\/\w+;base64,/', '', $image);
        $image = str_replace(' ', '+', $image);

        $fileName = 'signatures/'.uniqid().'.png';

        Storage::disk('public')->put($fileName, base64_decode($image));

        return $fileName;
    }
}
