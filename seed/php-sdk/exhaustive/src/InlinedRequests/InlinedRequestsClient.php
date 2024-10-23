<?php

namespace Seed\InlinedRequests;

use Seed\Core\Client\RawClient;
use Seed\InlinedRequests\Requests\PostWithObjectBody;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class InlinedRequestsClient
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
     * POST with custom object in request body, response is an object
     *
     * @param PostWithObjectBody $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return ObjectWithOptionalField
     * @throws SeedException
     * @throws SeedApiException
     */
    public function postWithObjectBodyandResponse(PostWithObjectBody $request, ?array $options = null): ObjectWithOptionalField
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/req-bodies/object",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ObjectWithOptionalField::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
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
