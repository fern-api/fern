<?php

namespace Seed\Users;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Users\Requests\ListUsersCursorPaginationRequest;
use Seed\Core\Pagination\Pager;
use Seed\Users\Types\User;
use Seed\Core\Pagination\CursorPager;
use Seed\Users\Types\ListUsersPaginationResponse;
use Seed\Users\Requests\ListUsersMixedTypeCursorPaginationRequest;
use Seed\Users\Types\ListUsersMixedTypePaginationResponse;
use Seed\Users\Requests\ListUsersBodyCursorPaginationRequest;
use Seed\Core\Pagination\PaginationHelper;
use Seed\Users\Requests\ListUsersOffsetPaginationRequest;
use Seed\Core\Pagination\OffsetPager;
use Seed\Users\Requests\ListUsersDoubleOffsetPaginationRequest;
use Seed\Users\Requests\ListUsersBodyOffsetPaginationRequest;
use Seed\Users\Requests\ListUsersOffsetStepPaginationRequest;
use Seed\Users\Requests\ListWithOffsetPaginationHasNextPageRequest;
use Seed\Users\Requests\ListUsersExtendedRequest;
use Seed\Users\Types\ListUsersExtendedResponse;
use Seed\Users\Requests\ListUsersExtendedRequestForOptionalData;
use Seed\Users\Types\ListUsersExtendedOptionalListResponse;
use Seed\Users\Requests\ListUsernamesRequest;
use Seed\Types\UsernameCursor;
use Seed\Users\Requests\ListUsernamesRequestCustom;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Users\Requests\ListWithGlobalConfigRequest;
use Seed\Users\Types\UsernameContainer;

class UsersClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
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
     * @param ListUsersCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithCursorPagination(ListUsersCursorPaginationRequest $request = new ListUsersCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsersCursorPaginationRequest $request) => $this->_listWithCursorPagination($request, $options),
            setCursor: function (ListUsersCursorPaginationRequest $request, string $cursor) {
                $request->setStartingAfter($cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (ListUsersPaginationResponse $response) => $response?->getPage()?->getNext()?->getStartingAfter() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
        );
    }

    /**
     * @param ListUsersMixedTypeCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithMixedTypeCursorPagination(ListUsersMixedTypeCursorPaginationRequest $request = new ListUsersMixedTypeCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsersMixedTypeCursorPaginationRequest $request) => $this->_listWithMixedTypeCursorPagination($request, $options),
            setCursor: function (ListUsersMixedTypeCursorPaginationRequest $request, string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (ListUsersMixedTypePaginationResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersMixedTypePaginationResponse $response) => $response?->getData() ?? [],
        );
    }

    /**
     * @param ListUsersBodyCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest $request = new ListUsersBodyCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsersBodyCursorPaginationRequest $request) => $this->_listWithBodyCursorPagination($request, $options),
            setCursor: function (ListUsersBodyCursorPaginationRequest $request, string $cursor) {
                PaginationHelper::setDeep($request, ["pagination", "cursor"], $cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (ListUsersPaginationResponse $response) => $response?->getPage()?->getNext()?->getStartingAfter() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
        );
    }

    /**
     * @param ListUsersOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetPagination(ListUsersOffsetPaginationRequest $request = new ListUsersOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListUsersOffsetPaginationRequest $request) => $this->_listWithOffsetPagination($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListUsersOffsetPaginationRequest $request) => $request?->getPage() ?? 0,
            setOffset: function (ListUsersOffsetPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            getStep: null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: null,
        );
    }

    /**
     * @param ListUsersDoubleOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithDoubleOffsetPagination(ListUsersDoubleOffsetPaginationRequest $request = new ListUsersDoubleOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListUsersDoubleOffsetPaginationRequest $request) => $this->_listWithDoubleOffsetPagination($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListUsersDoubleOffsetPaginationRequest $request) => $request?->getPage() ?? 0,
            setOffset: function (ListUsersDoubleOffsetPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            getStep: null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: null,
        );
    }

    /**
     * @param ListUsersBodyOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest $request = new ListUsersBodyOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListUsersBodyOffsetPaginationRequest $request) => $this->_listWithBodyOffsetPagination($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListUsersBodyOffsetPaginationRequest $request) => $request?->getPagination()?->getPage() ?? 0,
            setOffset: function (ListUsersBodyOffsetPaginationRequest $request, int $offset) {
                PaginationHelper::setDeep($request, ["pagination", "page"], $offset);
            },
            getStep: null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: null,
        );
    }

    /**
     * @param ListUsersOffsetStepPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest $request = new ListUsersOffsetStepPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListUsersOffsetStepPaginationRequest $request) => $this->_listWithOffsetStepPagination($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListUsersOffsetStepPaginationRequest $request) => $request?->getPage() ?? 0,
            setOffset: function (ListUsersOffsetStepPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            /* @phpstan-ignore-next-line */
            getStep: fn (ListUsersOffsetStepPaginationRequest $request) => $request?->getLimit() ?? 0,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: null,
        );
    }

    /**
     * @param ListWithOffsetPaginationHasNextPageRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetPaginationHasNextPage(ListWithOffsetPaginationHasNextPageRequest $request = new ListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListWithOffsetPaginationHasNextPageRequest $request) => $this->_listWithOffsetPaginationHasNextPage($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->getPage() ?? 0,
            setOffset: function (ListWithOffsetPaginationHasNextPageRequest $request, int $offset) {
                $request->setPage($offset);
            },
            /* @phpstan-ignore-next-line */
            getStep: fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->getLimit() ?? 0,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: fn (ListUsersPaginationResponse $response) => $response?->getHasNextPage(),
        );
    }

    /**
     * @param ListUsersExtendedRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithExtendedResults(ListUsersExtendedRequest $request = new ListUsersExtendedRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsersExtendedRequest $request) => $this->_listWithExtendedResults($request, $options),
            setCursor: function (ListUsersExtendedRequest $request, ?string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (ListUsersExtendedResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersExtendedResponse $response) => $response?->getData()?->getUsers() ?? [],
        );
    }

    /**
     * @param ListUsersExtendedRequestForOptionalData $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<User>
     */
    public function listWithExtendedResultsAndOptionalData(ListUsersExtendedRequestForOptionalData $request = new ListUsersExtendedRequestForOptionalData(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsersExtendedRequestForOptionalData $request) => $this->_listWithExtendedResultsAndOptionalData($request, $options),
            setCursor: function (ListUsersExtendedRequestForOptionalData $request, ?string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (ListUsersExtendedOptionalListResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (ListUsersExtendedOptionalListResponse $response) => $response?->getData()?->getUsers() ?? [],
        );
    }

    /**
     * @param ListUsernamesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<string>
     */
    public function listUsernames(ListUsernamesRequest $request = new ListUsernamesRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListUsernamesRequest $request) => $this->_listUsernames($request, $options),
            setCursor: function (ListUsernamesRequest $request, ?string $cursor) {
                $request->setStartingAfter($cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (UsernameCursor $response) => $response?->getCursor()?->getAfter() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (UsernameCursor $response) => $response?->getCursor()?->getData() ?? [],
        );
    }

    /**
     * @param ListUsernamesRequestCustom $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return UsernameCursor
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listUsernamesCustom(ListUsernamesRequestCustom $request = new ListUsernamesRequestCustom(), ?array $options = null): UsernameCursor
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getStartingAfter() != null) {
            $query['starting_after'] = $request->getStartingAfter();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return UsernameCursor::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListWithGlobalConfigRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<string>
     */
    public function listWithGlobalConfig(ListWithGlobalConfigRequest $request = new ListWithGlobalConfigRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            request: $request,
            getNextPage: fn (ListWithGlobalConfigRequest $request) => $this->_listWithGlobalConfig($request, $options),
            /* @phpstan-ignore-next-line */
            getOffset: fn (ListWithGlobalConfigRequest $request) => $request?->getOffset() ?? 0,
            setOffset: function (ListWithGlobalConfigRequest $request, int $offset) {
                $request->setOffset($offset);
            },
            getStep: null,
            /* @phpstan-ignore-next-line */
            getItems: fn (UsernameContainer $response) => $response?->getResults() ?? [],
            /* @phpstan-ignore-next-line */
            hasNextPage: null,
        );
    }

    /**
     * @param ListUsersCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithCursorPagination(ListUsersCursorPaginationRequest $request = new ListUsersCursorPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getPage() != null) {
            $query['page'] = $request->getPage();
        }
        if ($request->getPerPage() != null) {
            $query['per_page'] = $request->getPerPage();
        }
        if ($request->getOrder() != null) {
            $query['order'] = $request->getOrder();
        }
        if ($request->getStartingAfter() != null) {
            $query['starting_after'] = $request->getStartingAfter();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersMixedTypeCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersMixedTypePaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithMixedTypeCursorPagination(ListUsersMixedTypeCursorPaginationRequest $request = new ListUsersMixedTypeCursorPaginationRequest(), ?array $options = null): ListUsersMixedTypePaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getCursor() != null) {
            $query['cursor'] = $request->getCursor();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::POST,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersMixedTypePaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersBodyCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest $request = new ListUsersBodyCursorPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithOffsetPagination(ListUsersOffsetPaginationRequest $request = new ListUsersOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getPage() != null) {
            $query['page'] = $request->getPage();
        }
        if ($request->getPerPage() != null) {
            $query['per_page'] = $request->getPerPage();
        }
        if ($request->getOrder() != null) {
            $query['order'] = $request->getOrder();
        }
        if ($request->getStartingAfter() != null) {
            $query['starting_after'] = $request->getStartingAfter();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersDoubleOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithDoubleOffsetPagination(ListUsersDoubleOffsetPaginationRequest $request = new ListUsersDoubleOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getPage() != null) {
            $query['page'] = $request->getPage();
        }
        if ($request->getPerPage() != null) {
            $query['per_page'] = $request->getPerPage();
        }
        if ($request->getOrder() != null) {
            $query['order'] = $request->getOrder();
        }
        if ($request->getStartingAfter() != null) {
            $query['starting_after'] = $request->getStartingAfter();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersBodyOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest $request = new ListUsersBodyOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersOffsetStepPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest $request = new ListUsersOffsetStepPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getPage() != null) {
            $query['page'] = $request->getPage();
        }
        if ($request->getLimit() != null) {
            $query['limit'] = $request->getLimit();
        }
        if ($request->getOrder() != null) {
            $query['order'] = $request->getOrder();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListWithOffsetPaginationHasNextPageRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithOffsetPaginationHasNextPage(ListWithOffsetPaginationHasNextPageRequest $request = new ListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): ListUsersPaginationResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getPage() != null) {
            $query['page'] = $request->getPage();
        }
        if ($request->getLimit() != null) {
            $query['limit'] = $request->getLimit();
        }
        if ($request->getOrder() != null) {
            $query['order'] = $request->getOrder();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersPaginationResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersExtendedRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersExtendedResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithExtendedResults(ListUsersExtendedRequest $request = new ListUsersExtendedRequest(), ?array $options = null): ListUsersExtendedResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getCursor() != null) {
            $query['cursor'] = $request->getCursor();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersExtendedResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsersExtendedRequestForOptionalData $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ListUsersExtendedOptionalListResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithExtendedResultsAndOptionalData(ListUsersExtendedRequestForOptionalData $request = new ListUsersExtendedRequestForOptionalData(), ?array $options = null): ListUsersExtendedOptionalListResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getCursor() != null) {
            $query['cursor'] = $request->getCursor();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListUsersExtendedOptionalListResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListUsernamesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return UsernameCursor
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listUsernames(ListUsernamesRequest $request = new ListUsernamesRequest(), ?array $options = null): UsernameCursor
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getStartingAfter() != null) {
            $query['starting_after'] = $request->getStartingAfter();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return UsernameCursor::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
     * @param ListWithGlobalConfigRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return UsernameContainer
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listWithGlobalConfig(ListWithGlobalConfigRequest $request = new ListWithGlobalConfigRequest(), ?array $options = null): UsernameContainer
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->getOffset() != null) {
            $query['offset'] = $request->getOffset();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/users",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return UsernameContainer::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
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
