<?php

namespace Seed\ReqWithHeaders;

use Seed\Core\RawClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;

class ReqWithHeadersClient
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
     * @param ReqWithHeaders $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getWithCustomHeader(ReqWithHeaders $request, ?array $options = null): void
    {
        $headers = [];
        $headers['X-TEST-SERVICE-HEADER'] = $request->xTestServiceHeader;
        $headers['X-TEST-ENDPOINT-HEADER'] = $request->xTestEndpointHeader;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/test-headers/custom-header",
                    method: HttpMethod::POST,
                    headers: $headers,
                    body: $request->body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }
}
