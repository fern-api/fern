<?php

namespace Seed;

use Exception;
use GuzzleHttp\ClientInterface;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\HttpMethod;
use Seed\Core\JsonApiRequest;
use Seed\Core\RawClient;
use Seed\Requests\EchoRequest;
use GuzzleHttp\Client;
use Seed\Service\Client as ServiceClient;

class SeedClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var ?array{
     *     baseUrl?: string,
     *     client?: ClientInterface
     * } $clientOptions
     */
    private ?array $clientOptions;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @param string $token
     * @param ?array{
     *     baseUrl?: string,
     *     client?: ClientInterface
     * } $clientOptions
     */
    public function __construct(
        string $token,
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "Authorization" => "Bearer $token",
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->clientOptions = $clientOptions ?? [];
        $this->client = new RawClient(
            client: $this->clientOptions['client'] ?? new Client(),
            headers: $defaultHeaders,
        );
        $this->service = new ServiceClient($this->client);
    }

    /**
     * @throws Exception
     */
    public function echo(
        string $id,
        EchoRequest $request,
    ): mixed // TODO: Refactor this with typed response.
    {
        try {

            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->clientOptions['baseUrl'] ?? Environment::Production->value,
                    path: "/$id",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
        } catch (ClientExceptionInterface $e) {
            // TODO: Refactor this with typed exceptions.
            throw new Exception($e->getMessage());
        }
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 400) {
            // TODO: Refactor this with the fromJson method.
            return json_decode($response->getBody(), true);
        }
        // TODO: Refactor this with typed exceptions.
        throw new Exception(sprintf("Error with status code %d", $response->getStatusCode()));
    }
}
