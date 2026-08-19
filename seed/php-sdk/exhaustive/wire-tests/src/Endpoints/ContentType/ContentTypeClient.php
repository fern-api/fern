<?php

namespace Seed\Endpoints\ContentType;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;

class ContentTypeClient
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
     * $client->endpoints->contentType->postJsonPatchContentType(
     *     new ObjectWithOptionalField([
     *         'string' => 'string',
     *         'integer' => 1,
     *         'long' => 1000000,
     *         'double' => 1.1,
     *         'bool' => true,
     *         'datetime' => new DateTime('2024-01-15T09:30:00Z'),
     *         'date' => new DateTime('2023-01-15'),
     *         'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *         'base64' => 'SGVsbG8gd29ybGQh',
     *         'list' => [
     *             'list',
     *             'list',
     *         ],
     *         'set' => [
     *             'set',
     *         ],
     *         'map' => [
     *             1 => 'map',
     *         ],
     *         'bigint' => '1000000',
     *     ]),
     * );
     * ```
     *
     * @param ObjectWithOptionalField $request
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
    public function postJsonPatchContentType(ObjectWithOptionalField $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/foo/bar",
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

    /**
     * Example:
     * ```php
     * $client->endpoints->contentType->postJsonPatchContentWithCharsetType(
     *     new ObjectWithOptionalField([
     *         'string' => 'string',
     *         'integer' => 1,
     *         'long' => 1000000,
     *         'double' => 1.1,
     *         'bool' => true,
     *         'datetime' => new DateTime('2024-01-15T09:30:00Z'),
     *         'date' => new DateTime('2023-01-15'),
     *         'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *         'base64' => 'SGVsbG8gd29ybGQh',
     *         'list' => [
     *             'list',
     *             'list',
     *         ],
     *         'set' => [
     *             'set',
     *         ],
     *         'map' => [
     *             1 => 'map',
     *         ],
     *         'bigint' => '1000000',
     *     ]),
     * );
     * ```
     *
     * @param ObjectWithOptionalField $request
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
    public function postJsonPatchContentWithCharsetType(ObjectWithOptionalField $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/foo/baz",
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
