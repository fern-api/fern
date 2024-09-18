<?php

namespace Seed;

use Seed\A\AClient;
use Seed\Ast\AstClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use GuzzleHttp\Client;

class SeedClient
{
    /**
     * @var AClient $a
     */
    public AClient $a;

    /**
     * @var AstClient $ast
     */
    public AstClient $ast;

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
        $this->a = new AClient($this->client);
        $this->ast = new AstClient($this->client);
    }
}
