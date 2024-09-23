<?php

namespace Seed\Query;

use Seed\Core\RawClient;
use Seed\Query\Requests\SendLiteralsInQueryRequest;
use Seed\Types\SendResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class QueryClient
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
     * @param SendLiteralsInQueryRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return SendResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function send(SendLiteralsInQueryRequest $request, ?array $options = null): SendResponse
    {
        $query = [];
        $query['prompt'] = 'You are a helpful assistant';
        $query['query'] = $request->query;
        $query['stream'] = 'false';
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "query",
                    method: HttpMethod::POST,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return SendResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
