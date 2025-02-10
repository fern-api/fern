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
use Seed\Users\Requests\ListWithGlobalConfigRequest;
use Seed\Users\Types\UsernameContainer;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class UsersClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     *   maxRetries?: int,
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
     *   headers?: array<string, string>,
     *   maxRetries?: int,
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
     * } $options
     * @return Pager<User>
     */
    public function listWithCursorPagination(ListUsersCursorPaginationRequest $request = new ListUsersCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listWithCursorPaginationInternal'],
            function (ListUsersCursorPaginationRequest $request, string $cursor) {
                $request->startingAfter = $cursor;
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->page?->next?->startingAfter ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
        );
    }

    /**
     * @param ListUsersMixedTypeCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithMixedTypeCursorPagination(ListUsersMixedTypeCursorPaginationRequest $request = new ListUsersMixedTypeCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listWithMixedTypeCursorPaginationInternal'],
            function (ListUsersMixedTypeCursorPaginationRequest $request, string $cursor) {
                $request->cursor = $cursor;
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersMixedTypePaginationResponse $response) => $response?->next ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersMixedTypePaginationResponse $response) => $response?->data ?? [],
        );
    }

    /**
     * @param ListUsersBodyCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest $request = new ListUsersBodyCursorPaginationRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listWithBodyCursorPaginationInternal'],
            function (ListUsersBodyCursorPaginationRequest $request, string $cursor) {
                PaginationHelper::setDeep($request, ["pagination", "cursor"], $cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->page?->next?->startingAfter ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
        );
    }

    /**
     * @param ListUsersOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetPagination(ListUsersOffsetPaginationRequest $request = new ListUsersOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithOffsetPaginationInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetPaginationRequest $request) => $request?->page ?? 0,
            function (ListUsersOffsetPaginationRequest $request, int $offset) {
                $request->page = $offset;
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
            null,
        );
    }

    /**
     * @param ListUsersDoubleOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithDoubleOffsetPagination(ListUsersDoubleOffsetPaginationRequest $request = new ListUsersDoubleOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithDoubleOffsetPaginationInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListUsersDoubleOffsetPaginationRequest $request) => $request?->page ?? 0,
            function (ListUsersDoubleOffsetPaginationRequest $request, int $offset) {
                $request->page = $offset;
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
            null,
        );
    }

    /**
     * @param ListUsersBodyOffsetPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest $request = new ListUsersBodyOffsetPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithBodyOffsetPaginationInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListUsersBodyOffsetPaginationRequest $request) => $request?->pagination?->page ?? 0,
            function (ListUsersBodyOffsetPaginationRequest $request, int $offset) {
                PaginationHelper::setDeep($request, ["pagination", "page"], $offset);
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
            null,
        );
    }

    /**
     * @param ListUsersOffsetStepPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest $request = new ListUsersOffsetStepPaginationRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithOffsetStepPaginationInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetStepPaginationRequest $request) => $request?->page ?? 0,
            function (ListUsersOffsetStepPaginationRequest $request, int $offset) {
                $request->page = $offset;
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetStepPaginationRequest $request) => $request?->limit ?? 0,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
            null,
        );
    }

    /**
     * @param ListWithOffsetPaginationHasNextPageRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithOffsetPaginationHasNextPage(ListWithOffsetPaginationHasNextPageRequest $request = new ListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithOffsetPaginationHasNextPageInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->page ?? 0,
            function (ListWithOffsetPaginationHasNextPageRequest $request, int $offset) {
                $request->page = $offset;
            },
            /* @phpstan-ignore-next-line */
            fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->limit ?? 0,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->data ?? [],
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->hasNextPage,
        );
    }

    /**
     * @param ListUsersExtendedRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithExtendedResults(ListUsersExtendedRequest $request = new ListUsersExtendedRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listWithExtendedResultsInternal'],
            function (ListUsersExtendedRequest $request, string $cursor) {
                $request->cursor = $cursor;
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedResponse $response) => $response?->next ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedResponse $response) => $response?->data?->users ?? [],
        );
    }

    /**
     * @param ListUsersExtendedRequestForOptionalData $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<User>
     */
    public function listWithExtendedResultsAndOptionalData(ListUsersExtendedRequestForOptionalData $request = new ListUsersExtendedRequestForOptionalData(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listWithExtendedResultsAndOptionalDataInternal'],
            function (ListUsersExtendedRequestForOptionalData $request, string $cursor) {
                $request->cursor = $cursor;
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedOptionalListResponse $response) => $response?->next ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedOptionalListResponse $response) => $response?->data?->users ?? [],
        );
    }

    /**
     * @param ListUsernamesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<string>
     */
    public function listUsernames(ListUsernamesRequest $request = new ListUsernamesRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            $request,
            $options,
            [$this, 'listUsernamesInternal'],
            function (ListUsernamesRequest $request, string $cursor) {
                $request->startingAfter = $cursor;
            },
            /* @phpstan-ignore-next-line */
            fn (UsernameCursor $response) => $response?->cursor?->after ?? null,
            /* @phpstan-ignore-next-line */
            fn (UsernameCursor $response) => $response?->cursor?->data ?? [],
        );
    }

    /**
     * @param ListWithGlobalConfigRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return Pager<string>
     */
    public function listWithGlobalConfig(ListWithGlobalConfigRequest $request = new ListWithGlobalConfigRequest(), ?array $options = null): Pager
    {
        return new OffsetPager(
            $request,
            $options,
            [$this, 'listWithGlobalConfigInternal'],
            /* @phpstan-ignore-next-line */
            fn (ListWithGlobalConfigRequest $request) => $request?->offset ?? 0,
            function (ListWithGlobalConfigRequest $request, int $offset) {
                $request->offset = $offset;
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (UsernameContainer $response) => $response?->results ?? [],
            null,
        );
    }

    /**
     * @param ListUsersCursorPaginationRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithCursorPaginationInternal(ListUsersCursorPaginationRequest $request = new ListUsersCursorPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersMixedTypePaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithMixedTypeCursorPaginationInternal(ListUsersMixedTypeCursorPaginationRequest $request = new ListUsersMixedTypeCursorPaginationRequest(), ?array $options = null): ListUsersMixedTypePaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithBodyCursorPaginationInternal(ListUsersBodyCursorPaginationRequest $request = new ListUsersBodyCursorPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithOffsetPaginationInternal(ListUsersOffsetPaginationRequest $request = new ListUsersOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithDoubleOffsetPaginationInternal(ListUsersDoubleOffsetPaginationRequest $request = new ListUsersDoubleOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithBodyOffsetPaginationInternal(ListUsersBodyOffsetPaginationRequest $request = new ListUsersBodyOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithOffsetStepPaginationInternal(ListUsersOffsetStepPaginationRequest $request = new ListUsersOffsetStepPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithOffsetPaginationHasNextPageInternal(ListWithOffsetPaginationHasNextPageRequest $request = new ListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersExtendedResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithExtendedResultsInternal(ListUsersExtendedRequest $request = new ListUsersExtendedRequest(), ?array $options = null): ListUsersExtendedResponse
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
     * } $options
     * @return ListUsersExtendedOptionalListResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithExtendedResultsAndOptionalDataInternal(ListUsersExtendedRequestForOptionalData $request = new ListUsersExtendedRequestForOptionalData(), ?array $options = null): ListUsersExtendedOptionalListResponse
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
     * } $options
     * @return UsernameCursor
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listUsernamesInternal(ListUsernamesRequest $request = new ListUsernamesRequest(), ?array $options = null): UsernameCursor
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
     * } $options
     * @return UsernameContainer
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithGlobalConfigInternal(ListWithGlobalConfigRequest $request = new ListWithGlobalConfigRequest(), ?array $options = null): UsernameContainer
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
