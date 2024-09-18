<?php

namespace Seed\Service;

use Seed\Core\RawClient;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class ServiceClient
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
     * @param string $pathParam
     * @param string $serviceParam
     * @param string $resourceParam
     * @param int $endpointParam
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function post(string $pathParam, string $serviceParam, string $resourceParam, int $endpointParam, ?array $options): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
