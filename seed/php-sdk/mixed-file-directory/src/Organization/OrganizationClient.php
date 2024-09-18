<?php

namespace Seed\Organization;

use Seed\Core\RawClient;
use Seed\Organization\Types\CreateOrganizationRequest;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class OrganizationClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
    }

    /**
    * Create a new organization.
     * @param CreateOrganizationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function create(CreateOrganizationRequest $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
