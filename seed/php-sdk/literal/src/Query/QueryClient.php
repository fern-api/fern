<?php

namespace Seed\Query;

use Seed\Core\RawClient;
use Seed\Query\Requests\SendLiteralsInQueryRequest;
use Seed\Types\SendResponse;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
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
     * @param ?array{baseUrl?: string} $options
     * @returns SendResponse
     */
    public function send(SendLiteralsInQueryRequest $request, ?array $options = null): SendResponse
    {
        $query = [];
        $query['prompt'] = $request->prompt;
        $query['query'] = $request->query;
        $query['stream'] = $request->stream;
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
