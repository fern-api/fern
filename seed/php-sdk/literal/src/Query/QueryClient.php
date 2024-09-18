<?php

namespace Seed\Query;

use Seed\Core\RawClient;
use Seed\Query\Requests\SendLiteralsInQueryRequest;
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
     * @param SendLiteralsInQueryRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function send(SendLiteralsInQueryRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['prompt'] = request->prompt;
        $query['query'] = request->query;
        $query['stream'] = request->stream;
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
