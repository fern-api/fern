<?php

namespace Seed\Dataservice;

use Seed\Core\Client\RawClient;
use Seed\Dataservice\Requests\UploadRequest;
use Seed\Types\UploadResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Dataservice\Requests\DeleteRequest;
use Seed\Types\DeleteResponse;
use Seed\Dataservice\Requests\DescribeRequest;
use Seed\Types\DescribeResponse;
use Seed\Dataservice\Requests\FetchRequest;
use Seed\Types\FetchResponse;
use Seed\Dataservice\Requests\ListRequest;
use Seed\Types\ListResponse;
use Seed\Dataservice\Requests\QueryRequest;
use Seed\Types\QueryResponse;
use Seed\Dataservice\Requests\UpdateRequest;
use Seed\Types\UpdateResponse;

class DataserviceClient
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
     * @param UploadRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return UploadResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function upload(UploadRequest $request, ?array $options = null): UploadResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return UploadResponse::fromJson($json);
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
     * @param DeleteRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return DeleteResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function delete(DeleteRequest $request, ?array $options = null): DeleteResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/delete",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return DeleteResponse::fromJson($json);
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
     * @param DescribeRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return DescribeResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function describe(DescribeRequest $request, ?array $options = null): DescribeResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/describe",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return DescribeResponse::fromJson($json);
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
     * @param FetchRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return FetchResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function fetch(FetchRequest $request, ?array $options = null): FetchResponse
    {
        $query = [];
        if ($request->ids != null) {
            $query['ids'] = $request->ids;
        }
        if ($request->namespace != null) {
            $query['namespace'] = $request->namespace;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/fetch",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return FetchResponse::fromJson($json);
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
     * @param ListRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return ListResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function list(ListRequest $request, ?array $options = null): ListResponse
    {
        $query = [];
        if ($request->prefix != null) {
            $query['prefix'] = $request->prefix;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->paginationToken != null) {
            $query['paginationToken'] = $request->paginationToken;
        }
        if ($request->namespace != null) {
            $query['namespace'] = $request->namespace;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/list",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ListResponse::fromJson($json);
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
     * @param QueryRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return QueryResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function query(QueryRequest $request, ?array $options = null): QueryResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/query",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return QueryResponse::fromJson($json);
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
     * @param UpdateRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return UpdateResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function update(UpdateRequest $request, ?array $options = null): UpdateResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "data/update",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return UpdateResponse::fromJson($json);
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
