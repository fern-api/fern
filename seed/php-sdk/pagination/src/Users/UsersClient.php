<?php

namespace Seed\Users;

use Seed\Core\RawClient;
use Seed\Users\Requests\ListUsersCursorPaginationRequest;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Users\Requests\ListUsersBodyCursorPaginationRequest;
use Seed\Users\Requests\ListUsersOffsetPaginationRequest;
use Seed\Users\Requests\ListUsersBodyOffsetPaginationRequest;
use Seed\Users\Requests\ListUsersOffsetStepPaginationRequest;
use Seed\Users\Requests\ListWithOffsetPaginationHasNextPageRequest;
use Seed\Users\Requests\ListUsersExtendedRequest;
use Seed\Users\Requests\ListUsersExtendedRequestForOptionalData;
use Seed\Users\Requests\ListUsernamesRequest;
use Seed\Users\Requests\ListWithGlobalConfigRequest;

class UsersClient
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
     * @param ListUsersCursorPaginationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithCursorPagination(ListUsersCursorPaginationRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->perPage != null) {
            $query['per_page'] = $request->perPage;
        }
        if ($request->order != null) {
            $query['order'] = $request->order->value;
        }
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersBodyCursorPaginationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest $request, ?array $options): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersOffsetPaginationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithOffsetPagination(ListUsersOffsetPaginationRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->perPage != null) {
            $query['per_page'] = $request->perPage;
        }
        if ($request->order != null) {
            $query['order'] = $request->order->value;
        }
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersBodyOffsetPaginationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest $request, ?array $options): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersOffsetStepPaginationRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->order != null) {
            $query['order'] = $request->order->value;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListWithOffsetPaginationHasNextPageRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithOffsetPaginationHasNextPage(ListWithOffsetPaginationHasNextPageRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->page != null) {
            $query['page'] = $request->page;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->order != null) {
            $query['order'] = $request->order->value;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersExtendedRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithExtendedResults(ListUsersExtendedRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsersExtendedRequestForOptionalData $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithExtendedResultsAndOptionalData(ListUsersExtendedRequestForOptionalData $request, ?array $options): mixed
    {
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListUsernamesRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listUsernames(ListUsernamesRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->startingAfter != null) {
            $query['starting_after'] = $request->startingAfter;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListWithGlobalConfigRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function listWithGlobalConfig(ListWithGlobalConfigRequest $request, ?array $options): mixed
    {
        $query = [];
        if ($request->offset != null) {
            $query['offset'] = $request->offset;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
