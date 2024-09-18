<?php

namespace Seed\Dummy;

use Seed\Core\RawClient;
use Seed\Dummy\Requests\GenerateRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class DummyClient
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
     * @param GenerateRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function generate(GenerateRequest $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
