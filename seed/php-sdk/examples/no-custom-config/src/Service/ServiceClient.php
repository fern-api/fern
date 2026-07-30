<?php

namespace Seed\Service;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Types\Types\Movie;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\Json\JsonDecoder;
use Seed\Service\Requests\GetMetadataRequest;
use Seed\Types\Types\Metadata;
use Seed\Types\Types\BigEntity;
use Seed\Types\Types\Response;
use Seed\Types\Types\RefreshTokenRequest;

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
     * Example:
     * ```php
     * $client->service->getMovie(
     *     'movie-c06a4ad7',
     * );
     * ```
     *
     * @param string $movieId
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?Movie
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getMovie(string $movieId, ?array $options = null): ?Movie
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movie/" . RawClient::encodePathParam($movieId),
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return Movie::fromJson($json);
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
     * Example:
     * ```php
     * $client->service->createMovie(
     *     new Movie([
     *         'id' => 'movie-c06a4ad7',
     *         'prequel' => 'movie-cv9b914f',
     *         'title' => 'The Boy and the Heron',
     *         'from' => 'Hayao Miyazaki',
     *         'rating' => 8,
     *         'type' => 'movie',
     *         'tag' => 'tag-wf9as23d',
     *         'metadata' => [
     *             'actors' => [
     *                 "Christian Bale",
     *                 "Florence Pugh",
     *                 "Willem Dafoe",
     *             ],
     *             'releaseDate' => "2023-12-08",
     *             'ratings' => [
     *                 'rottenTomatoes' => 97,
     *                 'imdb' => 7.6,
     *             ],
     *         ],
     *         'revenue' => 1000000,
     *     ]),
     * );
     * ```
     *
     * @param Movie $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createMovie(Movie $request, ?array $options = null): ?string
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movie",
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->service->getMetadata(
     *     new GetMetadataRequest([
     *         'shallow' => false,
     *         'tag' => [
     *             'development',
     *         ],
     *         'xApiVersion' => '0.0.1',
     *     ]),
     * );
     * ```
     *
     * @param GetMetadataRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?Metadata
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getMetadata(GetMetadataRequest $request, ?array $options = null): ?Metadata
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->shallow != null) {
            $query['shallow'] = $request->shallow;
        }
        if ($request->tag != null) {
            $query['tag'] = $request->tag;
        }
        $headers = [];
        $headers['X-API-Version'] = $request->xApiVersion;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/metadata",
                    method: HttpMethod::GET,
                    headers: $headers,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return Metadata::fromJson($json);
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
     * Example:
     * ```php
     * $client->service->createBigEntity(
     *     new BigEntity([
     *         'castMember' => new Actor([
     *             'name' => 'name',
     *             'id' => 'id',
     *         ]),
     *         'extendedMovie' => new ExtendedMovie([
     *             'id' => 'id',
     *             'prequel' => 'prequel',
     *             'title' => 'title',
     *             'from' => 'from',
     *             'rating' => 1.1,
     *             'type' => 'movie',
     *             'tag' => 'tag',
     *             'book' => 'book',
     *             'metadata' => [
     *                 'metadata' => [
     *                     'key' => "value",
     *                 ],
     *             ],
     *             'revenue' => 1000000,
     *             'cast' => [
     *                 'cast',
     *                 'cast',
     *             ],
     *         ]),
     *         'entity' => new Entity([
     *             'type' => BasicType::Primitive->value,
     *             'name' => 'name',
     *         ]),
     *         'metadata' => Metadata::html([
     *             'extra' => 'extra',
     *         ], [
     *             'tags',
     *         ], 'metadata'),
     *         'commonMetadata' => new \Seed\Commons\Types\Types\Metadata([
     *             'id' => 'id',
     *             'data' => [
     *                 'data' => 'data',
     *             ],
     *             'jsonString' => 'jsonString',
     *         ]),
     *         'eventInfo' => EventInfo::metadata(new \Seed\Commons\Types\Types\Metadata([
     *             'id' => 'id',
     *             'data' => [
     *                 'data' => 'data',
     *             ],
     *             'jsonString' => 'jsonString',
     *         ])),
     *         'data' => Data::string('data'),
     *         'migration' => new Migration([
     *             'name' => 'name',
     *             'status' => MigrationStatus::Running->value,
     *         ]),
     *         'exception' => Exception::generic(new ExceptionInfo([
     *             'exceptionType' => 'exceptionType',
     *             'exceptionMessage' => 'exceptionMessage',
     *             'exceptionStacktrace' => 'exceptionStacktrace',
     *         ])),
     *         'test' => Test::and(true),
     *         'node' => new Node([
     *             'name' => 'name',
     *             'nodes' => [
     *                 new Node([
     *                     'name' => 'name',
     *                     'nodes' => [
     *                         new Node([
     *                             'name' => 'name',
     *                         ]),
     *                         new Node([
     *                             'name' => 'name',
     *                         ]),
     *                     ],
     *                     'trees' => [
     *                         new Tree([
     *                             'nodes' => [],
     *                         ]),
     *                         new Tree([
     *                             'nodes' => [],
     *                         ]),
     *                     ],
     *                 ]),
     *                 new Node([
     *                     'name' => 'name',
     *                     'nodes' => [
     *                         new Node([
     *                             'name' => 'name',
     *                         ]),
     *                         new Node([
     *                             'name' => 'name',
     *                         ]),
     *                     ],
     *                     'trees' => [
     *                         new Tree([
     *                             'nodes' => [],
     *                         ]),
     *                         new Tree([
     *                             'nodes' => [],
     *                         ]),
     *                     ],
     *                 ]),
     *             ],
     *             'trees' => [
     *                 new Tree([
     *                     'nodes' => [
     *                         new Node([
     *                             'name' => 'name',
     *                             'nodes' => [],
     *                             'trees' => [],
     *                         ]),
     *                         new Node([
     *                             'name' => 'name',
     *                             'nodes' => [],
     *                             'trees' => [],
     *                         ]),
     *                     ],
     *                 ]),
     *                 new Tree([
     *                     'nodes' => [
     *                         new Node([
     *                             'name' => 'name',
     *                             'nodes' => [],
     *                             'trees' => [],
     *                         ]),
     *                         new Node([
     *                             'name' => 'name',
     *                             'nodes' => [],
     *                             'trees' => [],
     *                         ]),
     *                     ],
     *                 ]),
     *             ],
     *         ]),
     *         'directory' => new Directory([
     *             'name' => 'name',
     *             'files' => [
     *                 new File([
     *                     'name' => 'name',
     *                     'contents' => 'contents',
     *                 ]),
     *                 new File([
     *                     'name' => 'name',
     *                     'contents' => 'contents',
     *                 ]),
     *             ],
     *             'directories' => [
     *                 new Directory([
     *                     'name' => 'name',
     *                     'files' => [
     *                         new File([
     *                             'name' => 'name',
     *                             'contents' => 'contents',
     *                         ]),
     *                         new File([
     *                             'name' => 'name',
     *                             'contents' => 'contents',
     *                         ]),
     *                     ],
     *                     'directories' => [
     *                         new Directory([
     *                             'name' => 'name',
     *                         ]),
     *                         new Directory([
     *                             'name' => 'name',
     *                         ]),
     *                     ],
     *                 ]),
     *                 new Directory([
     *                     'name' => 'name',
     *                     'files' => [
     *                         new File([
     *                             'name' => 'name',
     *                             'contents' => 'contents',
     *                         ]),
     *                         new File([
     *                             'name' => 'name',
     *                             'contents' => 'contents',
     *                         ]),
     *                     ],
     *                     'directories' => [
     *                         new Directory([
     *                             'name' => 'name',
     *                         ]),
     *                         new Directory([
     *                             'name' => 'name',
     *                         ]),
     *                     ],
     *                 ]),
     *             ],
     *         ]),
     *         'moment' => new Moment([
     *             'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *             'date' => new DateTime('2023-01-15'),
     *             'datetime' => new DateTime('2024-01-15T09:30:00Z'),
     *         ]),
     *     ]),
     * );
     * ```
     *
     * @param BigEntity $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?Response
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createBigEntity(BigEntity $request, ?array $options = null): ?Response
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/big-entity",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return Response::fromJson($json);
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
     * Example:
     * ```php
     * $client->service->refreshToken();
     * ```
     *
     * @param ?RefreshTokenRequest $request
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
    public function refreshToken(?RefreshTokenRequest $request = null, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/refresh-token",
                    method: HttpMethod::POST,
                    body: $request,
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
}
