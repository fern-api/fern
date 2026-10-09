<?php

namespace Seed\NullableOptional;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\NullableOptional\Types\UserResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\NullableOptional\Types\CreateUserRequest;
use Seed\NullableOptional\Types\UpdateUserRequest;
use Seed\NullableOptional\Requests\ListUsersRequest;
use Seed\Core\Json\JsonDecoder;
use Seed\NullableOptional\Requests\SearchUsersRequest;
use Seed\NullableOptional\Types\ComplexProfile;
use Seed\NullableOptional\Requests\UpdateComplexProfileRequest;
use Seed\NullableOptional\Types\DeserializationTestRequest;
use Seed\NullableOptional\Types\DeserializationTestResponse;
use Seed\NullableOptional\Requests\FilterByRoleRequest;
use Seed\NullableOptional\Types\NotificationMethod;
use Seed\NullableOptional\Requests\UpdateTagsRequest;
use Seed\NullableOptional\Requests\SearchRequest;
use Seed\NullableOptional\Types\SearchResult;

class NullableOptionalClient
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
     * Get a user by ID
     *
     * Example:
     * ```php
     * $client->nullableOptional->getUser(
     *     'userId',
     * );
     * ```
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
     * @return ?UserResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUser(string $userId, ?array $options = null): ?UserResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}",
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
                return UserResponse::fromJson($json);
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
     * Create a new user
     *
     * Example:
     * ```php
     * $client->nullableOptional->createUser(
     *     new CreateUserRequest([
     *         'username' => 'username',
     *         'email' => 'email',
     *         'phone' => 'phone',
     *         'address' => new Address([
     *             'street' => 'street',
     *             'city' => 'city',
     *             'state' => 'state',
     *             'zipCode' => 'zipCode',
     *             'country' => 'country',
     *             'buildingId' => 'buildingId',
     *             'tenantId' => 'tenantId',
     *         ]),
     *     ]),
     * );
     * ```
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
     * @return ?UserResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createUser(CreateUserRequest $request, ?array $options = null): ?UserResponse
    {
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
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return UserResponse::fromJson($json);
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
     * Update a user (partial update)
     *
     * Example:
     * ```php
     * $client->nullableOptional->updateUser(
     *     'userId',
     *     new UpdateUserRequest([
     *         'username' => 'username',
     *         'email' => 'email',
     *         'phone' => 'phone',
     *         'address' => new Address([
     *             'street' => 'street',
     *             'city' => 'city',
     *             'state' => 'state',
     *             'zipCode' => 'zipCode',
     *             'country' => 'country',
     *             'buildingId' => 'buildingId',
     *             'tenantId' => 'tenantId',
     *         ]),
     *     ]),
     * );
     * ```
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
     * @return ?UserResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateUser(string $userId, UpdateUserRequest $request, ?array $options = null): ?UserResponse
    {
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
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return UserResponse::fromJson($json);
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
     * List all users
     *
     * Example:
     * ```php
     * $client->nullableOptional->listUsers(
     *     new ListUsersRequest([
     *         'limit' => 1,
     *         'offset' => 1,
     *         'includeDeleted' => true,
     *         'sortBy' => 'sortBy',
     *     ]),
     * );
     * ```
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
     * @return ?array<UserResponse>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listUsers(ListUsersRequest $request = new ListUsersRequest(), ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->offset != null) {
            $query['offset'] = $request->offset;
        }
        if ($request->includeDeleted != null) {
            $query['includeDeleted'] = $request->includeDeleted;
        }
        if ($request->sortBy != null) {
            $query['sortBy'] = $request->sortBy;
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
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeArray($json, [UserResponse::class]); // @phpstan-ignore-line
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
     * Search users
     *
     * Example:
     * ```php
     * $client->nullableOptional->searchUsers(
     *     new SearchUsersRequest([
     *         'query' => 'query',
     *         'department' => 'department',
     *         'role' => 'role',
     *         'isActive' => true,
     *     ]),
     * );
     * ```
     *
     * @param SearchUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<UserResponse>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function searchUsers(SearchUsersRequest $request, ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['query'] = $request->query;
        $query['department'] = $request->department;
        if ($request->role != null) {
            $query['role'] = $request->role;
        }
        if ($request->isActive != null) {
            $query['isActive'] = $request->isActive;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/search",
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
                return JsonDecoder::decodeArray($json, [UserResponse::class]); // @phpstan-ignore-line
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
     * Create a complex profile to test nullable enums and unions
     *
     * Example:
     * ```php
     * $client->nullableOptional->createComplexProfile(
     *     new ComplexProfile([
     *         'id' => 'id',
     *         'nullableRole' => UserRole::Admin->value,
     *         'optionalRole' => UserRole::Admin->value,
     *         'optionalNullableRole' => UserRole::Admin->value,
     *         'nullableStatus' => UserStatus::Active->value,
     *         'optionalStatus' => UserStatus::Active->value,
     *         'optionalNullableStatus' => UserStatus::Active->value,
     *         'nullableNotification' => NotificationMethod::email(new EmailNotification([
     *             'emailAddress' => 'emailAddress',
     *             'subject' => 'subject',
     *             'htmlContent' => 'htmlContent',
     *         ])),
     *         'optionalNotification' => NotificationMethod::email(new EmailNotification([
     *             'emailAddress' => 'emailAddress',
     *             'subject' => 'subject',
     *             'htmlContent' => 'htmlContent',
     *         ])),
     *         'optionalNullableNotification' => NotificationMethod::email(new EmailNotification([
     *             'emailAddress' => 'emailAddress',
     *             'subject' => 'subject',
     *             'htmlContent' => 'htmlContent',
     *         ])),
     *         'nullableSearchResult' => SearchResult::user(new UserResponse([
     *             'id' => 'id',
     *             'username' => 'username',
     *             'email' => 'email',
     *             'phone' => 'phone',
     *             'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'address' => new Address([
     *                 'street' => 'street',
     *                 'city' => 'city',
     *                 'state' => 'state',
     *                 'zipCode' => 'zipCode',
     *                 'country' => 'country',
     *                 'buildingId' => 'buildingId',
     *                 'tenantId' => 'tenantId',
     *             ]),
     *         ])),
     *         'optionalSearchResult' => SearchResult::user(new UserResponse([
     *             'id' => 'id',
     *             'username' => 'username',
     *             'email' => 'email',
     *             'phone' => 'phone',
     *             'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'address' => new Address([
     *                 'street' => 'street',
     *                 'city' => 'city',
     *                 'state' => 'state',
     *                 'zipCode' => 'zipCode',
     *                 'country' => 'country',
     *                 'buildingId' => 'buildingId',
     *                 'tenantId' => 'tenantId',
     *             ]),
     *         ])),
     *         'nullableArray' => [
     *             'nullableArray',
     *             'nullableArray',
     *         ],
     *         'optionalArray' => [
     *             'optionalArray',
     *             'optionalArray',
     *         ],
     *         'optionalNullableArray' => [
     *             'optionalNullableArray',
     *             'optionalNullableArray',
     *         ],
     *         'nullableListOfNullables' => [
     *             'nullableListOfNullables',
     *             'nullableListOfNullables',
     *         ],
     *         'nullableMapOfNullables' => [
     *             'nullableMapOfNullables' => new Address([
     *                 'street' => 'street',
     *                 'city' => 'city',
     *                 'state' => 'state',
     *                 'zipCode' => 'zipCode',
     *                 'country' => 'country',
     *                 'buildingId' => 'buildingId',
     *                 'tenantId' => 'tenantId',
     *             ]),
     *         ],
     *         'nullableListOfUnions' => [
     *             NotificationMethod::email(new EmailNotification([
     *                 'emailAddress' => 'emailAddress',
     *                 'subject' => 'subject',
     *                 'htmlContent' => 'htmlContent',
     *             ])),
     *             NotificationMethod::email(new EmailNotification([
     *                 'emailAddress' => 'emailAddress',
     *                 'subject' => 'subject',
     *                 'htmlContent' => 'htmlContent',
     *             ])),
     *         ],
     *         'optionalMapOfEnums' => [
     *             'optionalMapOfEnums' => UserRole::Admin->value,
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param ComplexProfile $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?ComplexProfile
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createComplexProfile(ComplexProfile $request, ?array $options = null): ?ComplexProfile
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/profiles/complex",
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
                return ComplexProfile::fromJson($json);
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
     * Get a complex profile by ID
     *
     * Example:
     * ```php
     * $client->nullableOptional->getComplexProfile(
     *     'profileId',
     * );
     * ```
     *
     * @param string $profileId
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?ComplexProfile
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getComplexProfile(string $profileId, ?array $options = null): ?ComplexProfile
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/profiles/complex/{$profileId}",
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
                return ComplexProfile::fromJson($json);
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
     * Update complex profile to test nullable field updates
     *
     * Example:
     * ```php
     * $client->nullableOptional->updateComplexProfile(
     *     'profileId',
     *     new UpdateComplexProfileRequest([
     *         'nullableRole' => UserRole::Admin->value,
     *         'nullableStatus' => UserStatus::Active->value,
     *         'nullableNotification' => NotificationMethod::email(new EmailNotification([
     *             'emailAddress' => 'emailAddress',
     *             'subject' => 'subject',
     *             'htmlContent' => 'htmlContent',
     *         ])),
     *         'nullableSearchResult' => SearchResult::user(new UserResponse([
     *             'id' => 'id',
     *             'username' => 'username',
     *             'email' => 'email',
     *             'phone' => 'phone',
     *             'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'address' => new Address([
     *                 'street' => 'street',
     *                 'city' => 'city',
     *                 'state' => 'state',
     *                 'zipCode' => 'zipCode',
     *                 'country' => 'country',
     *                 'buildingId' => 'buildingId',
     *                 'tenantId' => 'tenantId',
     *             ]),
     *         ])),
     *         'nullableArray' => [
     *             'nullableArray',
     *             'nullableArray',
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param string $profileId
     * @param UpdateComplexProfileRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?ComplexProfile
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateComplexProfile(string $profileId, UpdateComplexProfileRequest $request = new UpdateComplexProfileRequest(), ?array $options = null): ?ComplexProfile
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/profiles/complex/{$profileId}",
                    method: HttpMethod::PATCH,
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
                return ComplexProfile::fromJson($json);
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
     * Test endpoint for validating null deserialization
     *
     * Example:
     * ```php
     * $client->nullableOptional->testDeserialization(
     *     new DeserializationTestRequest([
     *         'requiredString' => 'requiredString',
     *         'nullableString' => 'nullableString',
     *         'optionalString' => 'optionalString',
     *         'optionalNullableString' => 'optionalNullableString',
     *         'nullableEnum' => UserRole::Admin->value,
     *         'optionalEnum' => UserStatus::Active->value,
     *         'nullableUnion' => NotificationMethod::email(new EmailNotification([
     *             'emailAddress' => 'emailAddress',
     *             'subject' => 'subject',
     *             'htmlContent' => 'htmlContent',
     *         ])),
     *         'optionalUnion' => SearchResult::user(new UserResponse([
     *             'id' => 'id',
     *             'username' => 'username',
     *             'email' => 'email',
     *             'phone' => 'phone',
     *             'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
     *             'address' => new Address([
     *                 'street' => 'street',
     *                 'city' => 'city',
     *                 'state' => 'state',
     *                 'zipCode' => 'zipCode',
     *                 'country' => 'country',
     *                 'buildingId' => 'buildingId',
     *                 'tenantId' => 'tenantId',
     *             ]),
     *         ])),
     *         'nullableList' => [
     *             'nullableList',
     *             'nullableList',
     *         ],
     *         'nullableMap' => [
     *             'nullableMap' => 1,
     *         ],
     *         'nullableObject' => new Address([
     *             'street' => 'street',
     *             'city' => 'city',
     *             'state' => 'state',
     *             'zipCode' => 'zipCode',
     *             'country' => 'country',
     *             'buildingId' => 'buildingId',
     *             'tenantId' => 'tenantId',
     *         ]),
     *         'optionalObject' => new Organization([
     *             'id' => 'id',
     *             'name' => 'name',
     *             'domain' => 'domain',
     *             'employeeCount' => 1,
     *         ]),
     *     ]),
     * );
     * ```
     *
     * @param DeserializationTestRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?DeserializationTestResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function testDeserialization(DeserializationTestRequest $request, ?array $options = null): ?DeserializationTestResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/test/deserialization",
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
                return DeserializationTestResponse::fromJson($json);
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
     * Filter users by role with nullable enum
     *
     * Example:
     * ```php
     * $client->nullableOptional->filterByRole(
     *     new FilterByRoleRequest([
     *         'role' => UserRole::Admin->value,
     *         'status' => UserStatus::Active->value,
     *         'secondaryRole' => UserRole::Admin->value,
     *     ]),
     * );
     * ```
     *
     * @param FilterByRoleRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<UserResponse>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function filterByRole(FilterByRoleRequest $request, ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['role'] = $request->role;
        if ($request->status != null) {
            $query['status'] = $request->status;
        }
        if ($request->secondaryRole != null) {
            $query['secondaryRole'] = $request->secondaryRole;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/filter",
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
                return JsonDecoder::decodeArray($json, [UserResponse::class]); // @phpstan-ignore-line
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
     * Get notification settings which may be null
     *
     * Example:
     * ```php
     * $client->nullableOptional->getNotificationSettings(
     *     'userId',
     * );
     * ```
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
     * @return ?NotificationMethod
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getNotificationSettings(string $userId, ?array $options = null): ?NotificationMethod
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}/notifications",
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
                return NotificationMethod::fromJson($json);
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
     * Update tags to test array handling
     *
     * Example:
     * ```php
     * $client->nullableOptional->updateTags(
     *     'userId',
     *     new UpdateTagsRequest([
     *         'tags' => [
     *             'tags',
     *             'tags',
     *         ],
     *         'categories' => [
     *             'categories',
     *             'categories',
     *         ],
     *         'labels' => [
     *             'labels',
     *             'labels',
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param string $userId
     * @param UpdateTagsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<string>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateTags(string $userId, UpdateTagsRequest $request, ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/users/{$userId}/tags",
                    method: HttpMethod::PUT,
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
                return JsonDecoder::decodeArray($json, ['string']); // @phpstan-ignore-line
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
     * Get search results with nullable unions
     *
     * Example:
     * ```php
     * $client->nullableOptional->getSearchResults(
     *     new SearchRequest([
     *         'query' => 'query',
     *         'filters' => [
     *             'filters' => 'filters',
     *         ],
     *         'includeTypes' => [
     *             'includeTypes',
     *             'includeTypes',
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param SearchRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<SearchResult>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getSearchResults(SearchRequest $request, ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/api/search",
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
                return JsonDecoder::decodeArray($json, [SearchResult::class]); // @phpstan-ignore-line
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
