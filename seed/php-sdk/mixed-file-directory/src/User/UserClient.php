<?php

namespace Seed\User;

use Seed\User\Events\EventsClient;
use Seed\Core\RawClient;
use Seed\User\Requests\ListUsersRequest;
use Seed\User\Types\User;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Seed\Core\JsonDecoder;
use JsonException;
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
     *
     * @param ListUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return array<User>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function list(ListUsersRequest $request, ?array $options = null): array
    {
        $query = [];
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users/",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [User::class]); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
