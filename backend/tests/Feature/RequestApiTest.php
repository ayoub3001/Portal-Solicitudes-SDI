<?php

namespace Tests\Feature;

use App\Models\RequestM;
use App\Models\User;
use Database\Factories\TestAssetFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RequestApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_index_returns_only_own_requests_for_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownRequests = RequestM::factory()->count(2)->for($user)->create();
        RequestM::factory()->count(3)->for($otherUser)->create();

        $response = $this->actingAsApi($user)->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertEqualsCanonicalizing($ownRequests->pluck('id')->all(), $ids);
    }

    public function test_index_returns_all_requests_for_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        RequestM::factory()->count(2)->for($userA)->create();
        RequestM::factory()->count(3)->for($userB)->create();

        $response = $this->actingAsApi($admin)->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_store_creates_pending_request(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAsApi($user)->postJson('/api/requests', [
            'title' => 'Nueva solicitud',
            'description' => 'Descripción de la solicitud de prueba',
            'date' => '2026-06-22',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Nueva solicitud')
            ->assertJsonPath('data.date', '2026-06-22')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.document_path', null);

        $this->assertDatabaseHas('requests', [
            'user_id' => $user->id,
            'title' => 'Nueva solicitud',
            'date' => '2026-06-22',
            'status' => 'pending',
        ]);
    }

    public function test_store_accepts_pdf_document(): void
    {
        $user = User::factory()->create();
        $pdf = TestAssetFactory::pdfUpload();

        $response = $this->actingAsApi($user)->post('/api/requests', [
            'title' => 'Solicitud con PDF',
            'description' => 'Incluye documentación adjunta',
            'date' => '2026-06-15',
            'document' => $pdf,
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Solicitud con PDF');

        $documentPath = $response->json('data.document_path');
        $this->assertNotNull($documentPath);
        Storage::disk('public')->assertExists($documentPath);
    }

    public function test_show_returns_request_for_owner(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->for($user)->create();

        $response = $this->actingAsApi($user)->getJson("/api/requests/{$request->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $request->id)
            ->assertJsonPath('data.title', $request->title);
    }

    public function test_show_allows_admin_to_view_any_request(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $request = RequestM::factory()->for($user)->create();

        $response = $this->actingAsApi($admin)->getJson("/api/requests/{$request->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $request->id);
    }

    public function test_show_forbidden_for_other_user(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = RequestM::factory()->for($owner)->create();

        $response = $this->actingAsApi($intruder)->getJson("/api/requests/{$request->id}");

        $response->assertForbidden();
    }

    public function test_update_pending_request_by_owner(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->pending()->for($user)->create();

        $response = $this->actingAsApi($user)->putJson("/api/requests/{$request->id}", [
            'title' => 'Título actualizado',
            'description' => 'Descripción actualizada',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Título actualizado')
            ->assertJsonPath('data.description', 'Descripción actualizada');

        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'title' => 'Título actualizado',
        ]);
    }

    public function test_update_forbidden_when_not_pending(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->signed()->for($user)->create();

        $response = $this->actingAsApi($user)->putJson("/api/requests/{$request->id}", [
            'title' => 'No debería actualizarse',
        ]);

        $response->assertForbidden();
    }

    public function test_signature_updates_request_with_base64(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->pending()->for($user)->create();
        $signature = TestAssetFactory::base64Signature();

        $response = $this->actingAsApi($user)->postJson("/api/requests/{$request->id}/signature", [
            'signature' => $signature,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'signed')
            ->assertJsonPath('data.signature_path', fn ($value) => str_starts_with($value, 'signatures/'))
            ->assertJsonPath('data.signature_url', fn ($value) => $value !== null)
            ->assertJsonPath('data.signed_at', fn ($value) => $value !== null);

        $signaturePath = $response->json('data.signature_path');
        Storage::disk('public')->assertExists($signaturePath);

        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'status' => 'signed',
            'signature_path' => $signaturePath,
        ]);
    }

    public function test_signature_accepts_png_file_upload(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->pending()->for($user)->create();
        $png = TestAssetFactory::pngUpload();

        $response = $this->actingAsApi($user)->post("/api/requests/{$request->id}/signature", [
            'signature' => $png,
        ], ['Accept' => 'application/json']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'signed');

        $signaturePath = $response->json('data.signature_path');
        $this->assertNotNull($signaturePath);
        Storage::disk('public')->assertExists($signaturePath);
    }

    public function test_signature_forbidden_for_other_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $request = RequestM::factory()->pending()->for($owner)->create();

        $response = $this->actingAsApi($other)->postJson("/api/requests/{$request->id}/signature", [
            'signature' => TestAssetFactory::base64Signature(),
        ]);

        $response->assertForbidden();
    }

    public function test_approve_signed_request_as_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $request = RequestM::factory()->signed()->for($user)->create();

        $response = $this->actingAsApi($admin)->postJson("/api/requests/{$request->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'status' => 'approved',
        ]);
    }

    public function test_reject_signed_request_as_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $request = RequestM::factory()->signed()->for($user)->create();

        $response = $this->actingAsApi($admin)->postJson("/api/requests/{$request->id}/reject");

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_approve_forbidden_for_regular_user(): void
    {
        $user = User::factory()->create();
        $request = RequestM::factory()->signed()->for($user)->create();

        $response = $this->actingAsApi($user)->postJson("/api/requests/{$request->id}/approve");

        $response->assertForbidden();
    }

    public function test_approve_forbidden_when_request_is_not_signed(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $request = RequestM::factory()->pending()->for($user)->create();

        $response = $this->actingAsApi($admin)->postJson("/api/requests/{$request->id}/approve");

        $response->assertForbidden();
    }
}
