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
            fn (ListUsersCursorPaginationRequest $request) => $this->listWithCursorPaginationInternal($request, $options),
            function (ListUsersCursorPaginationRequest $request, string $cursor) {
                $request->setStartingAfter($cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getPage()?->getNext()?->getStartingAfter() ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersMixedTypeCursorPaginationRequest $request) => $this->listWithMixedTypeCursorPaginationInternal($request, $options),
            function (ListUsersMixedTypeCursorPaginationRequest $request, string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersMixedTypePaginationResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersMixedTypePaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersBodyCursorPaginationRequest $request) => $this->listWithBodyCursorPaginationInternal($request, $options),
            function (ListUsersBodyCursorPaginationRequest $request, string $cursor) {
                PaginationHelper::setDeep($request, ["pagination", "cursor"], $cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getPage()?->getNext()?->getStartingAfter() ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersOffsetPaginationRequest $request) => $this->listWithOffsetPaginationInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetPaginationRequest $request) => $request?->getPage() ?? 0,
            function (ListUsersOffsetPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersDoubleOffsetPaginationRequest $request) => $this->listWithDoubleOffsetPaginationInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListUsersDoubleOffsetPaginationRequest $request) => $request?->getPage() ?? 0,
            function (ListUsersDoubleOffsetPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersBodyOffsetPaginationRequest $request) => $this->listWithBodyOffsetPaginationInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListUsersBodyOffsetPaginationRequest $request) => $request?->getPagination()?->getPage() ?? 0,
            function (ListUsersBodyOffsetPaginationRequest $request, int $offset) {
                PaginationHelper::setDeep($request, ["pagination", "page"], $offset);
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListUsersOffsetStepPaginationRequest $request) => $this->listWithOffsetStepPaginationInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetStepPaginationRequest $request) => $request?->getPage() ?? 0,
            function (ListUsersOffsetStepPaginationRequest $request, int $offset) {
                $request->setPage($offset);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersOffsetStepPaginationRequest $request) => $request?->getLimit() ?? 0,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
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
            fn (ListWithOffsetPaginationHasNextPageRequest $request) => $this->listWithOffsetPaginationHasNextPageInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->getPage() ?? 0,
            function (ListWithOffsetPaginationHasNextPageRequest $request, int $offset) {
                $request->setPage($offset);
            },
            /* @phpstan-ignore-next-line */
            fn (ListWithOffsetPaginationHasNextPageRequest $request) => $request?->getLimit() ?? 0,
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getData() ?? [],
            /* @phpstan-ignore-next-line */
            fn (ListUsersPaginationResponse $response) => $response?->getHasNextPage(),
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
            fn (ListUsersExtendedRequest $request) => $this->listWithExtendedResultsInternal($request, $options),
            function (ListUsersExtendedRequest $request, ?string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedResponse $response) => $response?->getData()?->getUsers() ?? [],
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
            fn (ListUsersExtendedRequestForOptionalData $request) => $this->listWithExtendedResultsAndOptionalDataInternal($request, $options),
            function (ListUsersExtendedRequestForOptionalData $request, ?string $cursor) {
                $request->setCursor($cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedOptionalListResponse $response) => $response?->getNext() ?? null,
            /* @phpstan-ignore-next-line */
            fn (ListUsersExtendedOptionalListResponse $response) => $response?->getData()?->getUsers() ?? [],
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
            fn (ListUsernamesRequest $request) => $this->listUsernamesInternal($request, $options),
            function (ListUsernamesRequest $request, ?string $cursor) {
                $request->setStartingAfter($cursor);
            },
            /* @phpstan-ignore-next-line */
            fn (UsernameCursor $response) => $response?->getCursor()?->getAfter() ?? null,
            /* @phpstan-ignore-next-line */
            fn (UsernameCursor $response) => $response?->getCursor()?->getData() ?? [],
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
            fn (ListWithGlobalConfigRequest $request) => $this->listWithGlobalConfigInternal($request, $options),
            /* @phpstan-ignore-next-line */
            fn (ListWithGlobalConfigRequest $request) => $request?->getOffset() ?? 0,
            function (ListWithGlobalConfigRequest $request, int $offset) {
                $request->setOffset($offset);
            },
            null,
            /* @phpstan-ignore-next-line */
            fn (UsernameContainer $response) => $response?->getResults() ?? [],
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
     * } $options
     * @return ListUsersMixedTypePaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithMixedTypeCursorPaginationInternal(ListUsersMixedTypeCursorPaginationRequest $request = new ListUsersMixedTypeCursorPaginationRequest(), ?array $options = null): ListUsersMixedTypePaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithDoubleOffsetPaginationInternal(ListUsersDoubleOffsetPaginationRequest $request = new ListUsersDoubleOffsetPaginationRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersPaginationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithOffsetPaginationHasNextPageInternal(ListWithOffsetPaginationHasNextPageRequest $request = new ListWithOffsetPaginationHasNextPageRequest(), ?array $options = null): ListUsersPaginationResponse
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
     * } $options
     * @return ListUsersExtendedResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithExtendedResultsInternal(ListUsersExtendedRequest $request = new ListUsersExtendedRequest(), ?array $options = null): ListUsersExtendedResponse
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
     * } $options
     * @return ListUsersExtendedOptionalListResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithExtendedResultsAndOptionalDataInternal(ListUsersExtendedRequestForOptionalData $request = new ListUsersExtendedRequestForOptionalData(), ?array $options = null): ListUsersExtendedOptionalListResponse
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
     * } $options
     * @return UsernameCursor
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listUsernamesInternal(ListUsernamesRequest $request = new ListUsernamesRequest(), ?array $options = null): UsernameCursor
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
     * } $options
     * @return UsernameContainer
     * @throws SeedException
     * @throws SeedApiException
     */
    private function listWithGlobalConfigInternal(ListWithGlobalConfigRequest $request = new ListWithGlobalConfigRequest(), ?array $options = null): UsernameContainer
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
