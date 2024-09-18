<?php

namespace Seed\InlinedRequest;

use Seed\Core\RawClient;
use Seed\InlinedRequest\Requests\SendEnumInlinedRequest;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

class InlinedRequestClient
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
     * @param SendEnumInlinedRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function send(SendEnumInlinedRequest $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "inlined",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            )
            ;
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
