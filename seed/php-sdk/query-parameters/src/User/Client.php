<?php

namespace Seed\User;

use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\HttpMethod;
use Seed\Core\JsonApiRequest;
use Seed\Core\RawClient;
use Seed\User\Requests\GetUsersRequest;

class Client
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    public function __construct(
        RawClient $client,
    )
    {
        $this->client = $client;
    }

    /**
     * @throws Exception
     */
    public function getUsername(
        GetUsersRequest $request,
    ): mixed // TODO: Refactor with typed response.
    {
        try {
            $query = [];
            $query['limit'] = $request->limit;
            $query['id'] = $request->id;
            $query['date'] = $request->date->format('Y-m-d');
            $query['deadline'] = $request->deadline->format('c');
            if ($request->optionalString != null) {
                $query['optional'] = $request->optionalString;
            }
            if ($request->filter != null) {
                $query['filter'] = $request->filter;
            }
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->clientOptions['baseUrl'] ?? '',
                    path: "/user",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
        } catch (ClientExceptionInterface $e) {
            // TODO: Refactor this with typed exceptions.
            throw new Exception($e->getMessage());
        }
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 400) {
            // TODO: Refactor this with the fromJson method.
            return json_decode($response->getBody(), true);
        }
        // TODO: Refactor this with typed exceptions.
        throw new Exception(sprintf("Error with status code %d", $response->getStatusCode()));
    }
}
