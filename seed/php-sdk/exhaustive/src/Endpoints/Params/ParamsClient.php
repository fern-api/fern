<?php

namespace Seed\Endpoints\Params;

use Seed\Core\RawClient;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Endpoints\Params\Requests\GetWithQuery;
use Seed\Endpoints\Params\Requests\GetWithMultipleQuery;
use Seed\Endpoints\Params\Requests\GetWithPathAndQuery;

class ParamsClient
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
    * GET with path param
     * @param string $param
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getWithPath(string $param, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/params/path/$param",
                    method: HttpMethod::GET,
                ),
            )
            ;
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
    * GET with query param
     * @param GetWithQuery $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getWithQuery(GetWithQuery $request, ?array $options = null): mixed
    {
        $query = [];
        $query['query'] = $request->query;
        $query['number'] = $request->number;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/params",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            )
            ;
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * GET with multiple of same query param
     * @param GetWithMultipleQuery $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getWithAllowMultipleQuery(GetWithMultipleQuery $request, ?array $options = null): mixed
    {
        $query = [];
        $query['query'] = $request->query;
        $query['numer'] = $request->numer;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/params",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            )
            ;
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * GET with path and query params
     * @param string $param
     * @param GetWithPathAndQuery $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getWithPathAndQuery(string $param, GetWithPathAndQuery $request, ?array $options = null): mixed
    {
        $query = [];
        $query['query'] = $request->query;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/params/path-query/$param",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            )
            ;
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * PUT to update with path param
     * @param string $param
     * @param string $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function modifyWithPath(string $param, string $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "/params/path/$param",
                    method: HttpMethod::PUT,
                    body: $request,
                ),
            )
            ;
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
