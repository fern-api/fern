<?php

namespace Seed\Ec2;

use Seed\Core\RawClient;
use Seed\Ec2\Requests\BootInstanceRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class Ec2Client
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
     * @param BootInstanceRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function bootInstance(BootInstanceRequest $request, ?array $options): mixed
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
