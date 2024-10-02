<?php

namespace Seed\Service;

use Seed\Core\Client\RawClient;
use Seed\Service\Requests\MyRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Json\JsonApiRequest;
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
            $body = new MultipartFormData();
            if ($request->maybeString != null) {
                $body->add(name: 'maybeString', value: $request->maybeString);
            }
            $body->add(name: 'integer', value: $request->integer);
            $body->addPart(
                $request->file->toMultipartFormDataPart(name: 'file'),
            );
            foreach ($request->fileList as $file) {
                $body->addPart(
                    $file->toMultipartFormDataPart(name: 'fileList'),
                );
            }
            if ($request->maybeFile != null) {
                $body->addPart(
                    $request->maybeFile->toMultipartFormDataPart(name: 'maybeFile'),
                );
            }
            if ($request->maybeFileList != null) {
                foreach ($request->maybeFileList as $file) {
                    $body->addPart(
                        $file->toMultipartFormDataPart(name: 'maybeFileList'),
                    );
                }
            }
            if ($request->maybeInteger != null) {
                $body->add(name: 'maybeInteger', value: $request->maybeInteger);
            }
            if ($request->optionalListOfStrings != null) {
                foreach ($request->optionalListOfStrings as $item) {
                    $body->add(name: 'optionalListOfStrings', value: $item);
                }
            }
            foreach ($request->listOfObjects as $item) {
                $body->add(name: 'listOfObjects', value: $item->toJson());
            }
            if ($request->optionalMetadata != null) {
                $body->add(name: 'optionalMetadata', value: json_encode($request->optionalMetadata));
            }
            if ($request->optionalObjectType != null) {
                $body->add(name: 'optionalObjectType', value: $request->optionalObjectType->value);
            }
            if ($request->optionalId != null) {
                $body->add(name: 'optionalId', value: $request->optionalId);
            }
            ;
        } catch (SeedException $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "",
                    method: HttpMethod::POST,
                    body: $request,
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
            $body = new MultipartFormData();
            $body->addPart(
                $request->file->toMultipartFormDataPart(name: 'file'),
            );
            ;
        } catch (SeedException $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/just-file",
                    method: HttpMethod::POST,
                    body: $request,
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
            $body = new MultipartFormData();
            $body->addPart(
                $request->file->toMultipartFormDataPart(name: 'file'),
            );
            ;
        } catch (SeedException $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/just-file-with-query-params",
                    method: HttpMethod::POST,
                    query: $query,
                    body: $request,
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
            $body = new MultipartFormData();
            $body->addPart(
                $request->file->toMultipartFormDataPart(name: 'file'),
            );
            $body->add(name: 'foo', value: $request->foo);
            $body->add(name: 'bar', value: $request->bar->toJson());
            ;
        } catch (SeedException $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/with-content-type",
                    method: HttpMethod::POST,
                    body: $request,
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
