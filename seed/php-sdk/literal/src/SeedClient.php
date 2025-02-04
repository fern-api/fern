<?php

namespace Seed;

use Seed\Headers\HeadersClient;
use Seed\Inlined\InlinedClient;
use Seed\Path\PathClient;
use Seed\Query\QueryClient;
use Seed\Reference\ReferenceClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var HeadersClient $headers
     */
    public HeadersClient $headers;

    /**
     * @var InlinedClient $inlined
     */
    public InlinedClient $inlined;

    /**
     * @var PathClient $path
     */
    public PathClient $path;

    /**
     * @var QueryClient $query
     */
    public QueryClient $query;

    /**
     * @var ReferenceClient $reference
     */
    public ReferenceClient $reference;

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
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-API-Version' => '02-02-2024',
            'X-API-Enable-Audit-Logging' => 'true',
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->headers = new HeadersClient($this->client);
        $this->inlined = new InlinedClient($this->client);
        $this->path = new PathClient($this->client);
        $this->query = new QueryClient($this->client);
        $this->reference = new ReferenceClient($this->client);
    }
}
