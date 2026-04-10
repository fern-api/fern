<?php

namespace Seed;

use Seed\Organization\OrganizationClient;
use Seed\User\UserClient;
use Seed\UserEvents\UserEventsClient;
use Seed\UserEventsMetadata\UserEventsMetadataClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var OrganizationClient $organization
     */
    public OrganizationClient $organization;

    /**
     * @var UserClient $user
     */
    public UserClient $user;

    /**
     * @var UserEventsClient $userEvents
     */
    public UserEventsClient $userEvents;

    /**
     * @var UserEventsMetadataClient $userEventsMetadata
     */
    public UserEventsMetadataClient $userEventsMetadata;

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

        $this->organization = new OrganizationClient($this->client, $this->options);
        $this->user = new UserClient($this->client, $this->options);
        $this->userEvents = new UserEventsClient($this->client, $this->options);
        $this->userEventsMetadata = new UserEventsMetadataClient($this->client, $this->options);
    }
}
