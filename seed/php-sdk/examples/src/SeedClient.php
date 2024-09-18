<?php

namespace Seed;

use Seed\Commons\CommonsClient;
use Seed\File\FileClient;
use Seed\Health\HealthClient;
use Seed\Service\ServiceClient;
use Seed\Types\TypesClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use GuzzleHttp\Client;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class SeedClient
{
    /**
     * @var CommonsClient $commons
     */
    public CommonsClient $commons;

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
     * @var TypesClient $types
     */
    public TypesClient $types;

    /**
     * @var ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = ["X-Fern-Language" => "PHP","X-Fern-SDK-Name" => "Seed","X-Fern-SDK-Version" => "0.0.1"];
        $this->options = $options ?? [];
        $this->client = new RawClient(client: $this->options['client'] ?? new Client(), headers: $defaultHeaders);
        $this->commons = new CommonsClient($this->client);
        $this->file = new FileClient($this->client);
        $this->health = new HealthClient($this->client);
        $this->service = new ServiceClient($this->client);
        $this->types = new TypesClient($this->client);
    }

    /**
     * @param string $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function echo(string $request, ?array $options = null): mixed
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
