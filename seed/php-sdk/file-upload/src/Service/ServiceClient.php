<?php

namespace Seed\Service;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Service\Requests\ServicePostRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Multipart\MultipartApiRequest;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Service\Requests\ServiceJustFileRequest;
use Seed\Service\Requests\ServiceJustFileWithQueryParamsRequest;
use Seed\Service\Requests\ServiceJustFileWithOptionalQueryParamsRequest;
use Seed\Service\Requests\ServiceWithContentTypeRequest;
use Seed\Service\Requests\ServiceWithFormEncodingRequest;
use Seed\Service\Requests\ServiceWithFormEncodedContainersRequest;
use Seed\Service\Requests\ServiceOptionalArgsRequest;
use Seed\Core\Json\JsonDecoder;
use JsonException;
use Seed\Service\Requests\ServiceWithInlineTypeRequest;
use Seed\Service\Requests\ServiceWithJsonPropertyRequest;
use Seed\Core\Json\JsonApiRequest;
use Seed\Service\Requests\ServiceWithLiteralAndEnumTypesRequest;

class ServiceClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
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
     * @param ServicePostRequest $request
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
    public function post(ServicePostRequest $request = new ServicePostRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->maybeString != null) {
            $body->add(name: 'maybe_string', value: $request->maybeString);
        }
        if ($request->integer != null) {
            $body->add(name: 'integer', value: $request->integer);
        }
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->fileList != null) {
            $body->addPart($request->fileList->toMultipartFormDataPart('file_list'));
        }
        if ($request->maybeFile != null) {
            $body->addPart($request->maybeFile->toMultipartFormDataPart('maybe_file'));
        }
        if ($request->maybeFileList != null) {
            $body->addPart($request->maybeFileList->toMultipartFormDataPart('maybe_file_list'));
        }
        if ($request->maybeInteger != null) {
            $body->add(name: 'maybe_integer', value: $request->maybeInteger);
        }
        if ($request->optionalListOfStrings != null) {
            $body->add(name: 'optional_list_of_strings', value: $request->optionalListOfStrings);
        }
        if ($request->listOfObjects != null) {
            foreach ($request->listOfObjects as $element) {
                $body->add(name: 'list_of_objects', value: $element->toJson());
            }
        }
        if ($request->optionalMetadata != null) {
            $body->add(name: 'optional_metadata', value: $request->optionalMetadata);
        }
        if ($request->optionalObjectType != null) {
            $body->add(name: 'optional_object_type', value: $request->optionalObjectType);
        }
        if ($request->optionalId != null) {
            $body->add(name: 'optional_id', value: $request->optionalId);
        }
        if ($request->aliasObject != null) {
            $body->add(name: 'alias_object', value: $request->aliasObject->toJson());
        }
        if ($request->listOfAliasObject != null) {
            foreach ($request->listOfAliasObject as $element) {
                $body->add(name: 'list_of_alias_object', value: $element->toJson());
            }
        }
        if ($request->aliasListOfObject != null) {
            foreach ($request->aliasListOfObject as $element) {
                $body->add(name: 'alias_list_of_object', value: $element->toJson());
            }
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
     * @param ServiceJustFileRequest $request
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
    public function justfile(ServiceJustFileRequest $request = new ServiceJustFileRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "just-file",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
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
     * @param ServiceJustFileWithQueryParamsRequest $request
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
    public function justfilewithqueryparams(ServiceJustFileWithQueryParamsRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['integer'] = $request->integer;
        if ($request->maybeString != null) {
            $query['maybeString'] = $request->maybeString;
        }
        if ($request->maybeInteger != null) {
            $query['maybeInteger'] = $request->maybeInteger;
        }
        if ($request->listOfStrings != null) {
            $query['listOfStrings'] = $request->listOfStrings;
        }
        if ($request->optionalListOfStrings != null) {
            $query['optionalListOfStrings'] = $request->optionalListOfStrings;
        }
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "just-file-with-query-params",
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
     * @param ServiceJustFileWithOptionalQueryParamsRequest $request
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
    public function justfilewithoptionalqueryparams(ServiceJustFileWithOptionalQueryParamsRequest $request = new ServiceJustFileWithOptionalQueryParamsRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->maybeString != null) {
            $query['maybeString'] = $request->maybeString;
        }
        if ($request->maybeInteger != null) {
            $query['maybeInteger'] = $request->maybeInteger;
        }
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "just-file-with-optional-query-params",
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
     * @param ServiceWithContentTypeRequest $request
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
    public function withcontenttype(ServiceWithContentTypeRequest $request = new ServiceWithContentTypeRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->foo != null) {
            $body->add(name: 'foo', value: $request->foo);
        }
        if ($request->bar != null) {
            $body->add(name: 'bar', value: $request->bar->toJson());
        }
        if ($request->fooBar != null) {
            $body->add(name: 'foo_bar', value: $request->fooBar->toJson());
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "with-content-type",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
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
     * @param ServiceWithFormEncodingRequest $request
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
    public function withformencoding(ServiceWithFormEncodingRequest $request = new ServiceWithFormEncodingRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->foo != null) {
            $body->add(name: 'foo', value: $request->foo);
        }
        if ($request->bar != null) {
            $body->add(name: 'bar', value: $request->bar->toJson());
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "with-form-encoding",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
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
     * @param ServiceWithFormEncodedContainersRequest $request
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
    public function withformencodedcontainers(ServiceWithFormEncodedContainersRequest $request = new ServiceWithFormEncodedContainersRequest(), ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->maybeString != null) {
            $body->add(name: 'maybe_string', value: $request->maybeString);
        }
        if ($request->integer != null) {
            $body->add(name: 'integer', value: $request->integer);
        }
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->fileList != null) {
            $body->addPart($request->fileList->toMultipartFormDataPart('file_list'));
        }
        if ($request->maybeFile != null) {
            $body->addPart($request->maybeFile->toMultipartFormDataPart('maybe_file'));
        }
        if ($request->maybeFileList != null) {
            $body->addPart($request->maybeFileList->toMultipartFormDataPart('maybe_file_list'));
        }
        if ($request->maybeInteger != null) {
            $body->add(name: 'maybe_integer', value: $request->maybeInteger);
        }
        if ($request->optionalListOfStrings != null) {
            $body->add(name: 'optional_list_of_strings', value: $request->optionalListOfStrings);
        }
        if ($request->listOfObjects != null) {
            foreach ($request->listOfObjects as $element) {
                $body->add(name: 'list_of_objects', value: $element->toJson());
            }
        }
        if ($request->optionalMetadata != null) {
            $body->add(name: 'optional_metadata', value: $request->optionalMetadata);
        }
        if ($request->optionalObjectType != null) {
            $body->add(name: 'optional_object_type', value: $request->optionalObjectType);
        }
        if ($request->optionalId != null) {
            $body->add(name: 'optional_id', value: $request->optionalId);
        }
        if ($request->listOfObjectsWithOptionals != null) {
            foreach ($request->listOfObjectsWithOptionals as $element) {
                $body->add(name: 'list_of_objects_with_optionals', value: $element->toJson());
            }
        }
        if ($request->aliasObject != null) {
            $body->add(name: 'alias_object', value: $request->aliasObject->toJson());
        }
        if ($request->listOfAliasObject != null) {
            foreach ($request->listOfAliasObject as $element) {
                $body->add(name: 'list_of_alias_object', value: $element->toJson());
            }
        }
        if ($request->aliasListOfObject != null) {
            foreach ($request->aliasListOfObject as $element) {
                $body->add(name: 'alias_list_of_object', value: $element->toJson());
            }
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "form-encoded",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
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
     * @param ServiceOptionalArgsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @return ?string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function optionalargs(ServiceOptionalArgsRequest $request = new ServiceOptionalArgsRequest(), ?array $options = null): ?string
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->imageFile != null) {
            $body->addPart($request->imageFile->toMultipartFormDataPart('image_file'));
        }
        if ($request->request != null) {
            $body->add(name: 'request', value: $request->request);
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "optional-args",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeString($json);
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
     * @param ServiceWithInlineTypeRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @return ?string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withinlinetype(ServiceWithInlineTypeRequest $request = new ServiceWithInlineTypeRequest(), ?array $options = null): ?string
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->request != null) {
            $body->add(name: 'request', value: $request->request->toJson());
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "inline-type",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeString($json);
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
     * @param ServiceWithJsonPropertyRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @return ?string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withjsonproperty(ServiceWithJsonPropertyRequest $request = new ServiceWithJsonPropertyRequest(), ?array $options = null): ?string
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->json != null) {
            $body->add(name: 'json', value: $request->json->toJson());
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "with-json-property",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeString($json);
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
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function simple(?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "snippet",
                    method: HttpMethod::POST,
                ),
                $options,
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
     * @param ServiceWithLiteralAndEnumTypesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @return ?string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function withliteralandenumtypes(ServiceWithLiteralAndEnumTypesRequest $request = new ServiceWithLiteralAndEnumTypesRequest(), ?array $options = null): ?string
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        if ($request->modelType != null) {
            $body->add(name: 'model_type', value: $request->modelType);
        }
        if ($request->openEnum != null) {
            $body->add(name: 'open_enum', value: $request->openEnum);
        }
        if ($request->maybeName != null) {
            $body->add(name: 'maybe_name', value: $request->maybeName);
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "with-literal-enum",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeString($json);
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
