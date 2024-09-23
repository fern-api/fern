<?php

namespace Seed;

use Seed\File\FileClient;
use Seed\Health\HealthClient;
use Seed\Service\ServiceClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Seed\Core\JsonDecoder;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class SeedClient
{
    /**
     * @var FileClient $file
     */
    public FileClient $file;

    /**
     * @var HealthClient $health
     */
    public HealthClient $health;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @var ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     * } $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?string $token The token to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $token = null,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
        ];
        if ($token != null) {
            $defaultHeaders['Authorization'] = "Bearer $token";
        }

        $this->options = $options ?? [];
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->file = new FileClient($this->client);
        $this->health = new HealthClient($this->client);
        $this->service = new ServiceClient($this->client);
    }

    /**
     * @param string $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return string
     */
    public function echo_(string $request, ?array $options = null): string
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeString($json);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
