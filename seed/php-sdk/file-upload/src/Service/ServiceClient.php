<?php

namespace Seed\Service;

use Seed\Core\Client\RawClient;
use Seed\Service\Requests\MyRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartApiRequest;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Service\Requests\JustFileRequet;
use Seed\Service\Requests\JustFileWithQueryParamsRequet;
use Seed\Service\Requests\WithContentTypeRequest;

class ServiceClient
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
     * @param MyRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function post(MyRequest $request, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "",
                    method: HttpMethod::POST,
                    body: $body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param JustFileRequet $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function justFile(JustFileRequet $request, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/just-file",
                    method: HttpMethod::POST,
                    body: $body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param JustFileWithQueryParamsRequet $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function justFileWithQueryParams(JustFileWithQueryParamsRequet $request, ?array $options = null): void
    {
        $query = [];
        $query['integer'] = $request->integer;
        $query['listOfStrings'] = $request->listOfStrings;
        if ($request->maybeString != null) {
            $query['maybeString'] = $request->maybeString;
        }
        if ($request->maybeInteger != null) {
            $query['maybeInteger'] = $request->maybeInteger;
        }
        if ($request->optionalListOfStrings != null) {
            $query['optionalListOfStrings'] = $request->optionalListOfStrings;
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/just-file-with-query-params",
                    method: HttpMethod::POST,
                    query: $query,
                    body: $body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param WithContentTypeRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withContentType(WithContentTypeRequest $request, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/with-content-type",
                    method: HttpMethod::POST,
                    body: $body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
