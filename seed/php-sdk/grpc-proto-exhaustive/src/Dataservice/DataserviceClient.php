<?php

namespace Seed\Dataservice;

use Seed\Core\RawClient;
use Seed\Dataservice\Requests\UploadRequest;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Dataservice\Requests\DeleteRequest;
use Seed\Dataservice\Requests\DescribeRequest;
use Seed\Dataservice\Requests\FetchRequest;
use Seed\Dataservice\Requests\ListRequest;
use Seed\Dataservice\Requests\QueryRequest;
use Seed\Dataservice\Requests\UpdateRequest;

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
     * @returns mixed
     */
    public function upload(UploadRequest $request, ?array $options = null): mixed
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
     * @param DeleteRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function delete(DeleteRequest $request, ?array $options = null): mixed
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
     * @param DescribeRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function describe(DescribeRequest $request, ?array $options = null): mixed
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
     * @param FetchRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function fetch(FetchRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['ids'] = $request->ids;
        if ($request->namespace != null) {
            $query['namespace'] = $request->namespace;
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
     * @param ListRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function list(ListRequest $request, ?array $options = null): mixed
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
     * @param QueryRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function query(QueryRequest $request, ?array $options = null): mixed
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
     * @param UpdateRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function update(UpdateRequest $request, ?array $options = null): mixed
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

}
