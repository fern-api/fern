<?php

namespace Seed\User\Events;

use Seed\User\Events\Metadata\MetadataClient;
use Seed\Core\RawClient;
use Seed\User\Events\Requests\ListUserEventsRequest;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class EventsClient
{
    /**
     * @var MetadataClient $metadata
     */
    public MetadataClient $metadata;

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
        $this->metadata = new MetadataClient($this->client);
    }

    /**
    * List all user events.
     * @param ListUserEventsRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listEvents(ListUserEventsRequest $request, ?array $options = null): mixed
    {
        $query = [];
        if (request->limit != null) {
            $query['limit'] = request->limit;
        }
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
