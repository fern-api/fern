<?php

namespace Seed;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\User\Client as UserClient;

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
     * @var UserClient $user
     */
    public UserClient $user;

    /**
     * @param ?array{
     *     baseUrl?: string,
     *     client?: ClientInterface
     * } $clientOptions
     */
    public function __construct(
        ?array $clientOptions = null,
    ) {
        $defaultHeaders = [
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->clientOptions = $clientOptions ?? [];
        $this->client = new RawClient(
            client: $this->clientOptions['client'] ?? new Client(),
            headers: $defaultHeaders,
        );
        $this->user = new UserClient($this->client);
    }
}
