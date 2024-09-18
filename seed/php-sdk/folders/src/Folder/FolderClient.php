<?php

namespace Seed\Folder;

use Seed\Folder\Service\ServiceClient;
use Seed\Core\RawClient;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class FolderClient
{
    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

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
        $this->service = new ServiceClient($this->client);
    }

    /**
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function foo(?array $options = null): mixed
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
