<?php

namespace Seed\Service;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Service\Requests\ListResourcesRequest;
use Seed\Types\Types\Resource;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Json\JsonDecoder;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Service\Requests\GetResourceRequest;
use Seed\Service\Requests\SearchResourcesRequest;
use Seed\Types\Types\SearchResponse;
use Seed\Service\Requests\ListUsersRequest;
use Seed\Types\Types\PaginatedUserResponse;
use Seed\Service\Requests\GetUserRequest;
use Seed\Types\Types\User;
use Seed\Types\Types\CreateUserRequest;
use Seed\Types\Types\UpdateUserRequest;
use Seed\Service\Requests\ListConnectionsRequest;
use Seed\Types\Types\Connection;
use Seed\Service\Requests\GetConnectionRequest;
use Seed\Service\Requests\ListClientsRequest;
use Seed\Types\Types\PaginatedClientResponse;
use Seed\Service\Requests\GetClientRequest;
use Seed\Types\Types\Client;

class ServiceClient 
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    function __construct(
        RawClient $client,
        ?array $options = null,
    )
    {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * List resources with pagination
     *
     * @param ListResourcesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<Resource>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listResources(ListResourcesRequest $request, ?array $options = null): array {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['page'] = $request->page;
        $query['per_page'] = $request->perPage;
        $query['sort'] = $request->sort;
        $query['order'] = $request->order;
        $query['include_totals'] = $request->includeTotals;
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        if ($request->search != null){
            $query['search'] = $request->search;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/resources",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [Resource::class]); // @phpstan-ignore-line
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Get a single resource
     *
     * @param string $resourceId
     * @param GetResourceRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Resource
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getResource(string $resourceId, GetResourceRequest $request, ?array $options = null): Resource {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['include_metadata'] = $request->includeMetadata;
        $query['format'] = $request->format;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/resources/{$resourceId}",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return Resource::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Search resources with complex parameters
     *
     * @param SearchResourcesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return SearchResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function searchResources(SearchResourcesRequest $request, ?array $options = null): SearchResponse {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['limit'] = $request->limit;
        $query['offset'] = $request->offset;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/resources/search",
                    method: HttpMethod::POST,
                    query: $query,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return SearchResponse::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * List or search for users
     *
     * @param ListUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return PaginatedUserResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listUsers(ListUsersRequest $request = new ListUsersRequest(), ?array $options = null): PaginatedUserResponse {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null){
            $query['page'] = $request->page;
        }
        if ($request->perPage != null){
            $query['per_page'] = $request->perPage;
        }
        if ($request->includeTotals != null){
            $query['include_totals'] = $request->includeTotals;
        }
        if ($request->sort != null){
            $query['sort'] = $request->sort;
        }
        if ($request->connection != null){
            $query['connection'] = $request->connection;
        }
        if ($request->q != null){
            $query['q'] = $request->q;
        }
        if ($request->searchEngine != null){
            $query['search_engine'] = $request->searchEngine;
        }
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return PaginatedUserResponse::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Get a user by ID
     *
     * @param string $userId
     * @param GetUserRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUserById(string $userId, GetUserRequest $request = new GetUserRequest(), ?array $options = null): User {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        if ($request->includeFields != null){
            $query['include_fields'] = $request->includeFields;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return User::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Create a new user
     *
     * @param CreateUserRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createUser(CreateUserRequest $request, ?array $options = null): User {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return User::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Update a user
     *
     * @param string $userId
     * @param UpdateUserRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateUser(string $userId, UpdateUserRequest $request, ?array $options = null): User {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}",
                    method: HttpMethod::PATCH,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return User::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Delete a user
     *
     * @param string $userId
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function deleteUser(string $userId, ?array $options = null): void {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}",
                    method: HttpMethod::DELETE,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                return;
            }
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * List all connections
     *
     * @param ListConnectionsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<Connection>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listConnections(ListConnectionsRequest $request = new ListConnectionsRequest(), ?array $options = null): array {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->strategy != null){
            $query['strategy'] = $request->strategy;
        }
        if ($request->name != null){
            $query['name'] = $request->name;
        }
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/connections",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [Connection::class]); // @phpstan-ignore-line
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Get a connection by ID
     *
     * @param string $connectionId
     * @param GetConnectionRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Connection
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getConnection(string $connectionId, GetConnectionRequest $request = new GetConnectionRequest(), ?array $options = null): Connection {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/connections/{$connectionId}",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return Connection::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * List all clients/applications
     *
     * @param ListClientsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return PaginatedClientResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listClients(ListClientsRequest $request = new ListClientsRequest(), ?array $options = null): PaginatedClientResponse {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        if ($request->includeFields != null){
            $query['include_fields'] = $request->includeFields;
        }
        if ($request->page != null){
            $query['page'] = $request->page;
        }
        if ($request->perPage != null){
            $query['per_page'] = $request->perPage;
        }
        if ($request->includeTotals != null){
            $query['include_totals'] = $request->includeTotals;
        }
        if ($request->isGlobal != null){
            $query['is_global'] = $request->isGlobal;
        }
        if ($request->isFirstParty != null){
            $query['is_first_party'] = $request->isFirstParty;
        }
        if ($request->appType != null){
            $query['app_type'] = $request->appType;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/clients",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return PaginatedClientResponse::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * Get a client by ID
     *
     * @param string $clientId
     * @param GetClientRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Client
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getClient(string $clientId, GetClientRequest $request = new GetClientRequest(), ?array $options = null): Client {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->fields != null){
            $query['fields'] = $request->fields;
        }
        if ($request->includeFields != null){
            $query['include_fields'] = $request->includeFields;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/clients/{$clientId}",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return Client::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
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
