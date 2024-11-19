<?php

namespace Seed\Service;

use Seed\Core\Client\RawClient;
use Seed\Service\Requests\MyRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Json\JsonEncoder;
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
        $body = new MultipartFormData();
        if ($request->maybeString != null) {
            $body->add(name: 'maybeString', value: $request->maybeString);
        }
        $body->add(name: 'integer', value: $request->integer);
        $body->addPart($request->file->toMultipartFormDataPart('file'));
        foreach ($request->fileList as $file) {
            $body->addPart($file->toMultipartFormDataPart('fileList'));
        }
        if ($request->maybeFile != null) {
            $body->addPart($request->maybeFile->toMultipartFormDataPart('maybeFile'));
        }
        if ($request->maybeFileList != null) {
            foreach ($request->maybeFileList as $file) {
                $body->addPart($file->toMultipartFormDataPart('maybeFileList'));
            }
        }
        if ($request->maybeInteger != null) {
            $body->add(name: 'maybeInteger', value: $request->maybeInteger);
        }
        if ($request->optionalListOfStrings != null) {
            foreach ($request->optionalListOfStrings as $element) {
                $body->add(name: 'optionalListOfStrings', value: $element);
            }
        }
        foreach ($request->listOfObjects as $element) {
            $body->add(name: 'listOfObjects', value: $element->toJson());
        }
        if ($request->optionalMetadata != null) {
            $body->add(name: 'optionalMetadata', value: JsonEncoder::encode($request->optionalMetadata));
        }
        if ($request->optionalObjectType != null) {
            $body->add(name: 'optionalObjectType', value: $request->optionalObjectType);
        }
        if ($request->optionalId != null) {
            $body->add(name: 'optionalId', value: $request->optionalId);
        }
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
        $body = new MultipartFormData();
        $body->addPart($request->file->toMultipartFormDataPart('file'));
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
        $body = new MultipartFormData();
        $body->addPart($request->file->toMultipartFormDataPart('file'));
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
        $body = new MultipartFormData();
        $body->addPart(
            $request->file->toMultipartFormDataPart(
                name: 'file',
                contentType: 'application/octet-stream',
            ),
        );
        $body->add(name: 'foo', value: $request->foo);
        $body->add(
            name: 'bar',
            value: $request->bar->toJson(),
            contentType: 'application/json',
        );
        if ($request->foobar != null) {
            $body->add(
                name: 'foobar',
                value: $request->foobar->toJson(),
                contentType: 'application/json',
            );
        }
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
