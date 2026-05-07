<?php

namespace Seed;

use Seed\Inlinedrequests\InlinedrequestsClient;
use Seed\Noauth\NoauthClient;
use Seed\Noreqbody\NoreqbodyClient;
use Seed\Reqwithheaders\ReqwithheadersClient;
use Seed\Endpoints\EndpointsClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var InlinedrequestsClient $inlinedrequests
     */
    public InlinedrequestsClient $inlinedrequests;

    /**
     * @var NoauthClient $noauth
     */
    public NoauthClient $noauth;

    /**
     * @var NoreqbodyClient $noreqbody
     */
    public NoreqbodyClient $noreqbody;

    /**
     * @var ReqwithheadersClient $reqwithheaders
     */
    public ReqwithheadersClient $reqwithheaders;

    /**
     * @var EndpointsClient $endpoints
     */
    public EndpointsClient $endpoints;

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
     * @param ?string $token The token to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
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
            'User-Agent' => 'seed/seed/0.0.1',
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

        $this->inlinedrequests = new InlinedrequestsClient($this->client, $this->options);
        $this->noauth = new NoauthClient($this->client, $this->options);
        $this->noreqbody = new NoreqbodyClient($this->client, $this->options);
        $this->reqwithheaders = new ReqwithheadersClient($this->client, $this->options);
        $this->endpoints = new EndpointsClient($this->client, $this->options);
    }
}
