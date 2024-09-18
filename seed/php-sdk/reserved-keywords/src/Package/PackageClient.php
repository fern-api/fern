<?php

namespace Seed\Package;

use Seed\Core\RawClient;
use Seed\Package\Requests\TestRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class PackageClient
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
     * @param TestRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function test(TestRequest $request, ?array $options): mixed
    {
        $query = [];
        $query['for'] = $request->for;
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
