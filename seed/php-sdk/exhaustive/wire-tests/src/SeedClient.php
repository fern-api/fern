<?php

namespace Seed;

use Seed\EndpointsContainer\EndpointsContainerClient;
use Seed\EndpointsContentType\EndpointsContentTypeClient;
use Seed\EndpointsEnum\EndpointsEnumClient;
use Seed\EndpointsHttpMethods\EndpointsHttpMethodsClient;
use Seed\EndpointsObject\EndpointsObjectClient;
use Seed\EndpointsPagination\EndpointsPaginationClient;
use Seed\EndpointsParams\EndpointsParamsClient;
use Seed\EndpointsPrimitive\EndpointsPrimitiveClient;
use Seed\EndpointsPut\EndpointsPutClient;
use Seed\EndpointsUnion\EndpointsUnionClient;
use Seed\EndpointsUrLs\EndpointsUrLsClient;
use Seed\Inlinedrequests\InlinedrequestsClient;
use Seed\Noauth\NoauthClient;
use Seed\Noreqbody\NoreqbodyClient;
use Seed\Reqwithheaders\ReqwithheadersClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var EndpointsContainerClient $endpointsContainer
     */
    public EndpointsContainerClient $endpointsContainer;

    /**
     * @var EndpointsContentTypeClient $endpointsContentType
     */
    public EndpointsContentTypeClient $endpointsContentType;

    /**
     * @var EndpointsEnumClient $endpointsEnum
     */
    public EndpointsEnumClient $endpointsEnum;

    /**
     * @var EndpointsHttpMethodsClient $endpointsHttpMethods
     */
    public EndpointsHttpMethodsClient $endpointsHttpMethods;

    /**
     * @var EndpointsObjectClient $endpointsObject
     */
    public EndpointsObjectClient $endpointsObject;

    /**
     * @var EndpointsPaginationClient $endpointsPagination
     */
    public EndpointsPaginationClient $endpointsPagination;

    /**
     * @var EndpointsParamsClient $endpointsParams
     */
    public EndpointsParamsClient $endpointsParams;

    /**
     * @var EndpointsPrimitiveClient $endpointsPrimitive
     */
    public EndpointsPrimitiveClient $endpointsPrimitive;

    /**
     * @var EndpointsPutClient $endpointsPut
     */
    public EndpointsPutClient $endpointsPut;

    /**
     * @var EndpointsUnionClient $endpointsUnion
     */
    public EndpointsUnionClient $endpointsUnion;

    /**
     * @var EndpointsUrLsClient $endpointsUrLs
     */
    public EndpointsUrLsClient $endpointsUrLs;

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

        $this->endpointsContainer = new EndpointsContainerClient($this->client, $this->options);
        $this->endpointsContentType = new EndpointsContentTypeClient($this->client, $this->options);
        $this->endpointsEnum = new EndpointsEnumClient($this->client, $this->options);
        $this->endpointsHttpMethods = new EndpointsHttpMethodsClient($this->client, $this->options);
        $this->endpointsObject = new EndpointsObjectClient($this->client, $this->options);
        $this->endpointsPagination = new EndpointsPaginationClient($this->client, $this->options);
        $this->endpointsParams = new EndpointsParamsClient($this->client, $this->options);
        $this->endpointsPrimitive = new EndpointsPrimitiveClient($this->client, $this->options);
        $this->endpointsPut = new EndpointsPutClient($this->client, $this->options);
        $this->endpointsUnion = new EndpointsUnionClient($this->client, $this->options);
        $this->endpointsUrLs = new EndpointsUrLsClient($this->client, $this->options);
        $this->inlinedrequests = new InlinedrequestsClient($this->client, $this->options);
        $this->noauth = new NoauthClient($this->client, $this->options);
        $this->noreqbody = new NoreqbodyClient($this->client, $this->options);
        $this->reqwithheaders = new ReqwithheadersClient($this->client, $this->options);
    }
}
