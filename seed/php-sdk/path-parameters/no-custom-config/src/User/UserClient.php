<?php

namespace Seed\User;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\User\Types\User;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\User\Requests\UpdateUserRequest;
use Seed\User\Requests\SearchUsersRequest;
use Seed\Core\Json\JsonDecoder;

class UserClient
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
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * Example:
     * ```php
     * $client->user->getUser(
     *     'tenant_id',
     *     'user_id',
     * );
     * ```
     *
     * @param string $tenantId
     * @param string $userId
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUser(string $tenantId, string $userId, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/" . RawClient::encodePathParam($userId),
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
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

    /**
     * Example:
     * ```php
     * $client->user->createUser(
     *     'tenant_id',
     *     new User([
     *         'name' => 'name',
     *         'tags' => [
     *             'tags',
     *             'tags',
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param string $tenantId
     * @param User $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createUser(string $tenantId, User $request, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
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

    /**
     * Example:
     * ```php
     * $client->user->updateUser(
     *     'tenant_id',
     *     'user_id',
     *     new UpdateUserRequest([
     *         'body' => new User([
     *             'name' => 'name',
     *             'tags' => [
     *                 'tags',
     *                 'tags',
     *             ],
     *         ]),
     *     ]),
     * );
     * ```
     *
     * @param string $tenantId
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
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateUser(string $tenantId, string $userId, UpdateUserRequest $request, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/" . RawClient::encodePathParam($userId),
                    method: HttpMethod::PATCH,
                    body: $request->body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
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

    /**
     * Example:
     * ```php
     * $client->user->searchUsers(
     *     'tenant_id',
     *     'user_id',
     *     new SearchUsersRequest([
     *         'limit' => 1,
     *     ]),
     * );
     * ```
     *
     * @param string $tenantId
     * @param string $userId
     * @param SearchUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<User>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function searchUsers(string $tenantId, string $userId, SearchUsersRequest $request = new SearchUsersRequest(), ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/" . RawClient::encodePathParam($userId) . "/search",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeArray($json, [User::class]); // @phpstan-ignore-line
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

    /**
     * Test endpoint with path parameter that has a text prefix (v{version})
     *
     * Example:
     * ```php
     * $client->user->getUserMetadata(
     *     'tenant_id',
     *     'user_id',
     *     1,
     * );
     * ```
     *
     * @param string $tenantId
     * @param string $userId
     * @param int $version
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUserMetadata(string $tenantId, string $userId, int $version, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/" . RawClient::encodePathParam($userId) . "/metadata/v" . RawClient::encodePathParam($version),
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
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

    /**
     * Test endpoint with path parameters listed in different order than found in path
     *
     * Example:
     * ```php
     * $client->user->getUserSpecifics(
     *     'tenant_id',
     *     'user_id',
     *     1,
     *     'thought',
     * );
     * ```
     *
     * @param string $tenantId
     * @param string $userId
     * @param int $version
     * @param string $thought
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUserSpecifics(string $tenantId, string $userId, int $version, string $thought, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/" . RawClient::encodePathParam($tenantId) . "/user/" . RawClient::encodePathParam($userId) . "/specifics/" . RawClient::encodePathParam($version) . "/" . RawClient::encodePathParam($thought),
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
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
