<?php

namespace Seed\Service;

use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\HttpMethod;
use Seed\Core\JsonApiRequest;
use Seed\Core\RawClient;
use Seed\Environment;

class Client
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
    }

    /**
     * @throws Exception
     */
    public function nop(
        string $id,
        string $nestedId,
    ): void
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->clientOptions['baseUrl'] ?? Environment::Production->value,
                    path: "/$id/$nestedId",
                    method: HttpMethod::GET,
                ),
            );
        } catch (ClientExceptionInterface $e) {
            // TODO: Refactor this with typed exceptions.
            throw new Exception($e->getMessage());
        }
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 400) {
            return;
        }
        // TODO: Refactor this with typed exceptions.
        throw new Exception(sprintf("Error with status code %d", $response->getStatusCode()));
    }
}
