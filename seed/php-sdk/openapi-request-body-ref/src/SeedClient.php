<?php

namespace Seed;

use Seed\Vendor\VendorClient;
use Seed\Catalog\CatalogClient;
use Seed\TeamMember\TeamMemberClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var VendorClient $vendor
     */
    public VendorClient $vendor;

    /**
     * @var CatalogClient $catalog
     */
    public CatalogClient $catalog;

    /**
     * @var TeamMemberClient $teamMember
     */
    public TeamMemberClient $teamMember;

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
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
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

        $this->vendor = new VendorClient($this->client, $this->options);
        $this->catalog = new CatalogClient($this->client, $this->options);
        $this->teamMember = new TeamMemberClient($this->client, $this->options);
    }
}
