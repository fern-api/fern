<?php

namespace Seed\Dataservice;

use Seed\Core\RawClient;
use Seed\Dataservice\Requests\UploadRequest;
use Seed\Types\UploadResponse;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
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
     * @param ?array{baseUrl?: string} $options
     * @return UploadResponse
     */
    public function upload(UploadRequest $request, ?array $options = null): UploadResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param DeleteRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return DeleteResponse
     */
    public function delete(DeleteRequest $request, ?array $options = null): DeleteResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param DescribeRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return DescribeResponse
     */
    public function describe(DescribeRequest $request, ?array $options = null): DescribeResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param FetchRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return FetchResponse
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
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ListRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return ListResponse
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
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param QueryRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return QueryResponse
     */
    public function query(QueryRequest $request, ?array $options = null): QueryResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param UpdateRequest $request
     * @param ?array{baseUrl?: string} $options
     * @return UpdateResponse
     */
    public function update(UpdateRequest $request, ?array $options = null): UpdateResponse
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
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
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
