<?php

namespace Seed\InlineUsersInlineUsers;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithCursorPaginationRequest;
use Seed\Types\InlineUsersListUsersPaginationResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest;
use Seed\Types\InlineUsersListUsersMixedTypePaginationResponse;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithBodyCursorPaginationRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetPaginationRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithBodyOffsetPaginationRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetStepPaginationRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithExtendedResultsRequest;
use Seed\Types\InlineUsersListUsersExtendedResponse;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest;
use Seed\Types\InlineUsersListUsersExtendedOptionalListResponse;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListUsernamesRequest;
use Seed\Types\UsernameCursor;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithGlobalConfigRequest;
use Seed\Types\InlineUsersUsernameContainer;

class InlineUsersInlineUsersClient
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
     * @param InlineUsersInlineUsersListWithCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithCursorPagination(InlineUsersInlineUsersListWithCursorPaginationRequest $request = new InlineUsersInlineUsersListWithCursorPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->perPage != null) {
            $query['per_page'] = $request->perPage;
        }
        if ($request->order != null) {
            $query['order'] = $request->order;
        }
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/cursor",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersMixedTypePaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithMixedTypeCursorPagination(InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest $request = new InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest(), ?array $options = null): ?InlineUsersListUsersMixedTypePaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/mixed-type-cursor",
                    method: HttpMethod::POST,
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
                return InlineUsersListUsersMixedTypePaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithBodyCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithBodyCursorPagination(InlineUsersInlineUsersListWithBodyCursorPaginationRequest $request = new InlineUsersInlineUsersListWithBodyCursorPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/body-cursor",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithOffsetPagination(InlineUsersInlineUsersListWithOffsetPaginationRequest $request = new InlineUsersInlineUsersListWithOffsetPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->perPage != null) {
            $query['per_page'] = $request->perPage;
        }
        if ($request->order != null) {
            $query['order'] = $request->order;
        }
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/offset",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithDoubleOffsetPagination(InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest $request = new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->perPage != null) {
            $query['per_page'] = $request->perPage;
        }
        if ($request->order != null) {
            $query['order'] = $request->order;
        }
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/double-offset",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithBodyOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithBodyOffsetPagination(InlineUsersInlineUsersListWithBodyOffsetPaginationRequest $request = new InlineUsersInlineUsersListWithBodyOffsetPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/body-offset",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithOffsetStepPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithOffsetStepPagination(InlineUsersInlineUsersListWithOffsetStepPaginationRequest $request = new InlineUsersInlineUsersListWithOffsetStepPaginationRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->order != null) {
            $query['order'] = $request->order;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/offset-step",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest $request = new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): ?InlineUsersListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->order != null) {
            $query['order'] = $request->order;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/offset-has-next-page",
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
                return InlineUsersListUsersPaginationResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithExtendedResultsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersExtendedResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithExtendedResults(InlineUsersInlineUsersListWithExtendedResultsRequest $request = new InlineUsersInlineUsersListWithExtendedResultsRequest(), ?array $options = null): ?InlineUsersListUsersExtendedResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/extended",
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
                return InlineUsersListUsersExtendedResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersListUsersExtendedOptionalListResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest $request = new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest(), ?array $options = null): ?InlineUsersListUsersExtendedOptionalListResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/extended-optional",
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
                return InlineUsersListUsersExtendedOptionalListResponse::fromJson($json);
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
     * @param InlineUsersInlineUsersListUsernamesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?UsernameCursor
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListUsernames(InlineUsersInlineUsersListUsernamesRequest $request = new InlineUsersInlineUsersListUsernamesRequest(), ?array $options = null): ?UsernameCursor
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/usernames",
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
                return UsernameCursor::fromJson($json);
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
     * @param InlineUsersInlineUsersListWithGlobalConfigRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?InlineUsersUsernameContainer
     * @throws SeedException
     * @throws SeedApiException
     */
    public function inlineUsersInlineUsersListWithGlobalConfig(InlineUsersInlineUsersListWithGlobalConfigRequest $request = new InlineUsersInlineUsersListWithGlobalConfigRequest(), ?array $options = null): ?InlineUsersUsernameContainer
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->offset != null) {
            $query['offset'] = $request->offset;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-users/global-config",
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
                return InlineUsersUsernameContainer::fromJson($json);
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
