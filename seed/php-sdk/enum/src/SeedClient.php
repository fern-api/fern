<?php

namespace Seed;

use Seed\Headers\HeadersClient;
use Seed\Inlinedrequest\InlinedrequestClient;
use Seed\Multipartform\MultipartformClient;
use Seed\Pathparam\PathparamClient;
use Seed\Queryparam\QueryparamClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var HeadersClient $headers
     */
    public HeadersClient $headers;

    /**
     * @var InlinedrequestClient $inlinedrequest
     */
    public InlinedrequestClient $inlinedrequest;

    /**
     * @var MultipartformClient $multipartform
     */
    public MultipartformClient $multipartform;

    /**
     * @var PathparamClient $pathparam
     */
    public PathparamClient $pathparam;

    /**
     * @var QueryparamClient $queryparam
     */
    public QueryparamClient $queryparam;

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

        $this->headers = new HeadersClient($this->client, $this->options);
        $this->inlinedrequest = new InlinedrequestClient($this->client, $this->options);
        $this->multipartform = new MultipartformClient($this->client, $this->options);
        $this->pathparam = new PathparamClient($this->client, $this->options);
        $this->queryparam = new QueryparamClient($this->client, $this->options);
    }
}
