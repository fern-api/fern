<?php

namespace Seed\User;

use Seed\User\Events\EventsClient;
use Seed\Core\RawClient;
use Seed\User\Requests\ListUsersRequest;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class UserClient
{
    /**
     * @var EventsClient $events
     */
    public EventsClient $events;

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
        $this->events = new EventsClient($this->client);
    }

    /**
    * List all users.
     * @param ListUsersRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function list(ListUsersRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
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
