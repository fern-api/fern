<?php

namespace Seed\User;

use Seed\Core\RawClient;
use Seed\User\Requests\GetUsersRequest;
use Seed\User\Types\User;
use Seed\Core\Constant;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class UserClient
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
     * @param GetUsersRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return User
     */
    public function getUsername(GetUsersRequest $request, ?array $options = null): User
    {
        $query = [];
        $query['limit'] = $request->limit;
        $query['id'] = $request->id;
        $query['date'] = $request->date->format(Constant::DateFormat);
        $query['deadline'] = $request->deadline->format(Constant::DateTimeFormat);
        $query['bytes'] = $request->bytes;
        $query['user'] = $request->user;
        $query['userList'] = $request->userList;
        $query['keyValue'] = $request->keyValue;
        $query['nestedUser'] = $request->nestedUser;
        $query['excludeUser'] = $request->excludeUser;
        $query['filter'] = $request->filter;
        if ($request->optionalDeadline != null) {
            $query['optionalDeadline'] = $request->optionalDeadline;
        }
        if ($request->optionalString != null) {
            $query['optionalString'] = $request->optionalString;
        }
        if ($request->optionalUser != null) {
            $query['optionalUser'] = $request->optionalUser;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/user",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return User::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
