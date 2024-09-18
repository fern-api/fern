<?php

namespace Seed\Dummy;

use Seed\Core\RawClient;
use Seed\Dummy\Requests\GenerateStreamRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;
use Seed\Dummy\Requests\Generateequest;
use JsonException;

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
     * @param GenerateStreamRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function generateStream(GenerateStreamRequest $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param Generateequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function generate(Generateequest $request, ?array $options = null): mixed
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
