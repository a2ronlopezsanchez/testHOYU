<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::with(['addresses', 'contacts'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Client $client) => $this->transformClientForForm($client))
            ->values();

        return response()->json($clients);
    }

    public function show(Client $client): JsonResponse
    {
        $client->load(['addresses', 'contacts']);

        return response()->json($this->transformClientForForm($client));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);

        $client = DB::transaction(function () use ($data) {
            $client = Client::create($this->mapClientData($data));
            $this->syncAddresses($client, $data);
            $this->syncContacts($client, $data);

            return $client->load(['addresses', 'contacts']);
        });

        return response()->json([
            'message' => 'Cliente creado correctamente.',
            'id' => $client->id,
            'client' => $this->transformClientForForm($client),
        ], 201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $this->validatePayload($request, $client);

        $client = DB::transaction(function () use ($client, $data) {
            $client->update($this->mapClientData($data));
            $this->syncAddresses($client, $data, true);
            $this->syncContacts($client, $data, true);

            return $client->load(['addresses', 'contacts']);
        });

        return response()->json([
            'message' => 'Cliente actualizado correctamente.',
            'id' => $client->id,
            'client' => $this->transformClientForForm($client),
        ]);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json([
            'message' => 'Cliente eliminado correctamente.',
        ]);
    }

    private function validatePayload(Request $request, ?Client $client = null): array
    {
        return $request->validate([
            'tipo' => ['required', 'string', Rule::in(['Persona Moral', 'Persona Física'])],
            'status' => ['required', 'string', Rule::in(['Prospecto', 'Activo', 'VIP', 'Inactivo'])],
            'nombreColoquial' => ['nullable', 'string', 'max:200'],
            'razonSocial' => [Rule::requiredIf(fn () => $request->input('tipo') === 'Persona Moral'), 'nullable', 'string', 'max:200'],
            'nombre' => [Rule::requiredIf(fn () => $request->input('tipo') === 'Persona Física'), 'nullable', 'string', 'max:100'],
            'apellidoPaterno' => [Rule::requiredIf(fn () => $request->input('tipo') === 'Persona Física'), 'nullable', 'string', 'max:100'],
            'apellidoMaterno' => ['nullable', 'string', 'max:100'],
            'rfc' => [
                'required',
                'string',
                'min:12',
                'max:13',
                Rule::unique('clients', 'rfc')->ignore($client?->id),
            ],
            'giro' => ['nullable', 'string', 'max:150'],
            'direccionFiscal' => ['required', 'array'],
            'direccionFiscal.calle' => ['nullable', 'string', 'max:255'],
            'direccionFiscal.colonia' => ['nullable', 'string', 'max:150'],
            'direccionFiscal.ciudad' => ['nullable', 'string', 'max:150'],
            'direccionFiscal.estado' => ['nullable', 'string', 'max:100'],
            'direccionFiscal.cp' => ['nullable', 'string', 'max:10'],
            'direccionFiscal.regimenFiscal' => ['nullable', 'string', 'max:10'],
            'direccionFisica' => ['nullable', 'array'],
            'direccionFisica.calle' => ['nullable', 'string', 'max:255'],
            'direccionFisica.colonia' => ['nullable', 'string', 'max:150'],
            'direccionFisica.ciudad' => ['nullable', 'string', 'max:150'],
            'direccionFisica.estado' => ['nullable', 'string', 'max:100'],
            'direccionFisica.cp' => ['nullable', 'string', 'max:10'],
            'contactoPrincipal' => ['required', 'array'],
            'contactoPrincipal.nombre' => ['required', 'string', 'max:150'],
            'contactoPrincipal.cargo' => ['nullable', 'string', 'max:150'],
            'contactoPrincipal.email' => ['required', 'email', 'max:150'],
            'contactoPrincipal.tel' => ['required', 'string', 'max:50'],
            'contactoPrincipal.whatsapp' => ['nullable', 'string', 'max:50'],
            'contactoPrincipal.cumpleanos' => ['nullable', 'string', 'max:5'],
            'contactoAlternativo' => ['nullable', 'array'],
            'contactoAlternativo.nombre' => ['nullable', 'string', 'max:150'],
            'contactoAlternativo.cargo' => ['nullable', 'string', 'max:150'],
            'contactoAlternativo.email' => ['nullable', 'email', 'max:150'],
            'contactoAlternativo.tel' => ['nullable', 'string', 'max:50'],
            'contactoAlternativo.whatsapp' => ['nullable', 'string', 'max:50'],
            'contactoAlternativo.cumpleanos' => ['nullable', 'string', 'max:5'],
            'contactosAdicionales' => ['nullable', 'array'],
            'contactosAdicionales.*.nombre' => ['nullable', 'string', 'max:150'],
            'contactosAdicionales.*.cargo' => ['nullable', 'string', 'max:150'],
            'contactosAdicionales.*.email' => ['nullable', 'email', 'max:150'],
            'contactosAdicionales.*.tel' => ['nullable', 'string', 'max:50'],
            'contactosAdicionales.*.whatsapp' => ['nullable', 'string', 'max:50'],
            'contactosAdicionales.*.cumpleanos' => ['nullable', 'string', 'max:5'],
            'notas' => ['nullable', 'string'],
            'condicionesPago' => ['nullable', 'string'],
            'formaPago' => ['nullable', 'string', 'max:50'],
            'usoCfdi' => ['nullable', 'string', 'max:10'],
            'canalesComunicacion' => ['nullable', 'array'],
            'canalesComunicacion.*' => ['string', 'max:50'],
        ]);
    }

    private function mapClientData(array $data): array
    {
        $isCompany = $data['tipo'] === 'Persona Moral';
        $fullName = trim(implode(' ', array_filter([
            $data['nombre'] ?? null,
            $data['apellidoPaterno'] ?? null,
            $data['apellidoMaterno'] ?? null,
        ])));

        return [
            'client_type' => $data['tipo'],
            'status' => $data['status'],
            'business_name' => $isCompany ? ($data['razonSocial'] ?? null) : null,
            'trade_name' => $isCompany ? ($data['nombreColoquial'] ?? null) : ($data['nombreColoquial'] ?? ($fullName ?: null)),
            'first_name' => $isCompany ? null : ($data['nombre'] ?? null),
            'last_name' => $isCompany ? null : ($data['apellidoPaterno'] ?? null),
            'middle_name' => $isCompany ? null : ($data['apellidoMaterno'] ?? null),
            'rfc' => strtoupper($data['rfc']),
            'industry' => $data['giro'] ?? null,
            'notes' => $data['notas'] ?? null,
            'payment_terms' => $data['condicionesPago'] ?? null,
            'preferred_payment_method' => $data['formaPago'] ?? null,
            'cfdi_use' => $data['usoCfdi'] ?? null,
            'preferred_communication_channels' => $data['canalesComunicacion'] ?? [],
        ];
    }

    private function syncAddresses(Client $client, array $data, bool $replaceExisting = false): void
    {
        if ($replaceExisting) {
            $client->addresses()->get()->each->forceDelete();
        }

        $fiscalAddress = $data['direccionFiscal'] ?? [];
        $client->addresses()->create([
            'address_type' => 'fiscal',
            'street' => $fiscalAddress['calle'] ?? null,
            'postal_code' => $fiscalAddress['cp'] ?? null,
            'neighborhood' => $fiscalAddress['colonia'] ?? null,
            'city' => $fiscalAddress['ciudad'] ?? null,
            'state' => $fiscalAddress['estado'] ?? null,
            'tax_regime' => $fiscalAddress['regimenFiscal'] ?? null,
            'is_primary' => true,
        ]);

        $physicalAddress = $data['direccionFisica'] ?? null;
        if ($this->hasAddressData($physicalAddress)) {
            $client->addresses()->create([
                'address_type' => 'physical',
                'street' => $physicalAddress['calle'] ?? null,
                'postal_code' => $physicalAddress['cp'] ?? null,
                'neighborhood' => $physicalAddress['colonia'] ?? null,
                'city' => $physicalAddress['ciudad'] ?? null,
                'state' => $physicalAddress['estado'] ?? null,
                'tax_regime' => null,
                'is_primary' => false,
            ]);
        }
    }

    private function syncContacts(Client $client, array $data, bool $replaceExisting = false): void
    {
        if ($replaceExisting) {
            $client->contacts()->get()->each->forceDelete();
        }

        $principal = $data['contactoPrincipal'] ?? [];
        $client->contacts()->create([
            'contact_role' => 'primary',
            'full_name' => $principal['nombre'],
            'job_title' => $principal['cargo'] ?? null,
            'email' => $principal['email'] ?? null,
            'phone' => $principal['tel'] ?? null,
            'whatsapp' => $principal['whatsapp'] ?? null,
            'birthday' => $principal['cumpleanos'] ?? null,
            'is_primary' => true,
            'sort_order' => 0,
        ]);

        $alternate = $data['contactoAlternativo'] ?? null;
        if ($this->hasContactData($alternate)) {
            $client->contacts()->create([
                'contact_role' => 'alternate',
                'full_name' => $alternate['nombre'] ?? 'Contacto alternativo',
                'job_title' => $alternate['cargo'] ?? null,
                'email' => $alternate['email'] ?? null,
                'phone' => $alternate['tel'] ?? null,
                'whatsapp' => $alternate['whatsapp'] ?? null,
                'birthday' => $alternate['cumpleanos'] ?? null,
                'is_primary' => false,
                'sort_order' => 1,
            ]);
        }

        foreach ($data['contactosAdicionales'] ?? [] as $index => $contact) {
            if (! $this->hasContactData($contact)) {
                continue;
            }

            $client->contacts()->create([
                'contact_role' => 'additional',
                'full_name' => $contact['nombre'] ?? 'Contacto adicional',
                'job_title' => $contact['cargo'] ?? null,
                'email' => $contact['email'] ?? null,
                'phone' => $contact['tel'] ?? null,
                'whatsapp' => $contact['whatsapp'] ?? null,
                'birthday' => $contact['cumpleanos'] ?? null,
                'is_primary' => false,
                'sort_order' => $index + 2,
            ]);
        }
    }

    private function hasAddressData(?array $address): bool
    {
        if (! is_array($address)) {
            return false;
        }

        foreach (['calle', 'colonia', 'ciudad', 'estado', 'cp'] as $field) {
            if (! empty($address[$field])) {
                return true;
            }
        }

        return false;
    }

    private function hasContactData(?array $contact): bool
    {
        if (! is_array($contact)) {
            return false;
        }

        foreach (['nombre', 'cargo', 'email', 'tel', 'whatsapp', 'cumpleanos'] as $field) {
            if (! empty($contact[$field])) {
                return true;
            }
        }

        return false;
    }

    private function transformClientForForm(Client $client): array
    {
        $fiscal = $client->addresses->firstWhere('address_type', 'fiscal');
        $physical = $client->addresses->firstWhere('address_type', 'physical');
        $primary = $client->contacts->firstWhere('contact_role', 'primary')
            ?? $client->contacts->firstWhere('is_primary', true);
        $alternate = $client->contacts->firstWhere('contact_role', 'alternate');
        $additional = $client->contacts->where('contact_role', 'additional')->values();

        return [
            'id' => $client->id,
            'tipo' => $client->client_type,
            'status' => $client->status,
            'razonSocial' => $client->business_name,
            'nombreColoquial' => $client->trade_name ?? $this->fullName($client),
            'nombre' => $client->first_name,
            'apellidoPaterno' => $client->last_name,
            'apellidoMaterno' => $client->middle_name,
            'rfc' => $client->rfc,
            'giro' => $client->industry,
            'direccionFiscal' => $fiscal ? [
                'calle' => $fiscal->street,
                'colonia' => $fiscal->neighborhood,
                'ciudad' => $fiscal->city,
                'estado' => $fiscal->state,
                'cp' => $fiscal->postal_code,
                'regimenFiscal' => $fiscal->tax_regime,
            ] : null,
            'direccionFisica' => $physical ? [
                'calle' => $physical->street,
                'colonia' => $physical->neighborhood,
                'ciudad' => $physical->city,
                'estado' => $physical->state,
                'cp' => $physical->postal_code,
            ] : null,
            'contactoPrincipal' => $primary ? [
                'nombre' => $primary->full_name,
                'cargo' => $primary->job_title,
                'email' => $primary->email,
                'tel' => $primary->phone,
                'whatsapp' => $primary->whatsapp,
                'cumpleanos' => $primary->birthday,
            ] : null,
            'contactoAlternativo' => $alternate ? [
                'nombre' => $alternate->full_name,
                'cargo' => $alternate->job_title,
                'email' => $alternate->email,
                'tel' => $alternate->phone,
                'whatsapp' => $alternate->whatsapp,
                'cumpleanos' => $alternate->birthday,
            ] : null,
            'contactosAdicionales' => $additional->map(function ($contact) {
                return [
                    'nombre' => $contact->full_name,
                    'cargo' => $contact->job_title,
                    'email' => $contact->email,
                    'tel' => $contact->phone,
                    'whatsapp' => $contact->whatsapp,
                    'cumpleanos' => $contact->birthday,
                ];
            })->all(),
            'notas' => $client->notes,
            'condicionesPago' => $client->payment_terms,
            'formaPago' => $client->preferred_payment_method,
            'usoCfdi' => $client->cfdi_use,
            'canalesComunicacion' => $client->preferred_communication_channels ?? [],
            'totalEventos' => 0,
            'revenueTotal' => 0,
            'ultimoEvento' => null,
            'creadoEn' => optional($client->created_at)->toDateString(),
        ];
    }

    private function fullName(Client $client): string
    {
        return trim(implode(' ', array_filter([
            $client->first_name,
            $client->last_name,
            $client->middle_name,
        ])));
    }
}
