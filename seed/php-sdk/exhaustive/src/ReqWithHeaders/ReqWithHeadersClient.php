<?php

namespace Seed\ReqWithHeaders;

use Seed\Core\RawClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

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
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getWithCustomHeader(ReqWithHeaders $request, ?array $options = null): mixed
    {
        $headers = [];
        $headers['X-TEST-SERVICE-HEADER'] = $request->xTestServiceHeader;
        $headers['X-TEST-ENDPOINT-HEADER'] = $request->xTestEndpointHeader;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/test-headers/custom-header",
                    method: HttpMethod::POST,
                    headers: $headers,
                    body: $request->body,
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
