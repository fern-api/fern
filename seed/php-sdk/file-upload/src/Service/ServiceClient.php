<?php

namespace Seed\Service;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Service\Requests\MyRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Json\JsonEncoder;
use Seed\Core\Multipart\MultipartApiRequest;
use Seed\Core\Client\HttpMethod;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Service\Requests\JustFileRequest;
use Seed\Service\Requests\JustFileWithQueryParamsRequest;
use Seed\Service\Requests\WithContentTypeRequest;
use Seed\Service\Requests\WithFormEncodingRequest;

class ServiceClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
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
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
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
     * @param MyRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function post(MyRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->maybeString != null) {
            $body->add(name: 'maybe_string', value: $request->maybeString);
        }
        $body->add(name: 'integer', value: $request->integer);
        $body->addPart($request->file->toMultipartFormDataPart('file'));
        foreach ($request->fileList as $file) {
            $body->addPart($file->toMultipartFormDataPart('file_list'));
        }
        if ($request->maybeFile != null) {
            $body->addPart($request->maybeFile->toMultipartFormDataPart('maybe_file'));
        }
        if ($request->maybeFileList != null) {
            foreach ($request->maybeFileList as $file) {
                $body->addPart($file->toMultipartFormDataPart('maybe_file_list'));
            }
        }
        if ($request->maybeInteger != null) {
            $body->add(name: 'maybe_integer', value: $request->maybeInteger);
        }
        if ($request->optionalListOfStrings != null) {
            foreach ($request->optionalListOfStrings as $element) {
                $body->add(name: 'optional_list_of_strings', value: $element);
            }
        }
        foreach ($request->listOfObjects as $element) {
            $body->add(name: 'list_of_objects', value: $element->toJson());
        }
        if ($request->optionalMetadata != null) {
            $body->add(name: 'optional_metadata', value: JsonEncoder::encode($request->optionalMetadata));
        }
        if ($request->optionalObjectType != null) {
            $body->add(name: 'optional_object_type', value: $request->optionalObjectType);
        }
        if ($request->optionalId != null) {
            $body->add(name: 'optional_id', value: $request->optionalId);
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param JustFileRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function justFile(JustFileRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
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
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param JustFileWithQueryParamsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function justFileWithQueryParams(JustFileWithQueryParamsRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
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
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param WithContentTypeRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withContentType(WithContentTypeRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
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
        if ($request->fooBar != null) {
            $body->add(
                name: 'foo_bar',
                value: $request->fooBar->toJson(),
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
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
     * @param WithFormEncodingRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withFormEncoding(WithFormEncodingRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        $body->addPart(
            $request->file->toMultipartFormDataPart(
                name: 'file',
                contentType: 'application/octet-stream',
            ),
        );
        $body->add(name: 'foo', value: $request->foo);
        $body->add(name: 'bar', value: $request->bar->toJson());
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/with-form-encoding",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
