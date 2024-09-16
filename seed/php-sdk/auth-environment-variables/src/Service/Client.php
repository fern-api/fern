<?php

namespace Seed\Service;

use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\HttpMethod;
use Seed\Core\JsonApiRequest;
use Seed\Core\RawClient;
use Seed\Service\Requests\HeaderAuthRequest;

class Client
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    public function __construct(
        RawClient $client,
    )
    {
        $this->client = $client;
    }

    /**
     * @throws Exception
     */
    public function getUsername(
        HeaderAuthRequest $request,
    ): mixed // TODO: Refactor with typed response.
    {
        try {
            $headers = [];
            $headers['X-Endpoint-Header'] = $request->xEndpointHeader;
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->clientOptions['baseUrl'] ?? '',
                    path: "/apiKeyInHeader",
                    method: HttpMethod::GET,
                    headers: $headers,
                ),
            );
        } catch (ClientExceptionInterface $e) {
            // TODO: Refactor this with typed exceptions.
            throw new Exception($e->getMessage());
        }
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 400) {
            // TODO: Refactor this with the fromJson method.
            return json_decode($response->getBody(), true);
        }
        // TODO: Refactor this with typed exceptions.
        throw new Exception(sprintf("Error with status code %d", $response->getStatusCode()));
    }
}