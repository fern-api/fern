<?php

namespace Seed;

use Seed\Endpoints\EndpointsClient;
use Seed\GeneralErrors\GeneralErrorsClient;
use Seed\InlinedRequests\InlinedRequestsClient;
use Seed\NoAuth\NoAuthClient;
use Seed\NoReqBody\NoReqBodyClient;
use Seed\ReqWithHeaders\ReqWithHeadersClient;
use Seed\Types\TypesClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;

class SeedClient
{
    /**
     * @var EndpointsClient $endpoints
     */
    public EndpointsClient $endpoints;

    /**
     * @var GeneralErrorsClient $generalErrors
     */
    public GeneralErrorsClient $generalErrors;

    /**
     * @var InlinedRequestsClient $inlinedRequests
     */
    public InlinedRequestsClient $inlinedRequests;

    /**
     * @var NoAuthClient $noAuth
     */
    public NoAuthClient $noAuth;

    /**
     * @var NoReqBodyClient $noReqBody
     */
    public NoReqBodyClient $noReqBody;

    /**
     * @var ReqWithHeadersClient $reqWithHeaders
     */
    public ReqWithHeadersClient $reqWithHeaders;

    /**
     * @var TypesClient $types
     */
    public TypesClient $types;

    /**
     * @var ?array{baseUrl?: string, client?: ClientInterface, headers?: array<string, string>} $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?array{baseUrl?: string, client?: ClientInterface, headers?: array<string, string>} $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];

        $this->options = $options ?? [];
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->endpoints = new EndpointsClient($this->client);
        $this->generalErrors = new GeneralErrorsClient($this->client);
        $this->inlinedRequests = new InlinedRequestsClient($this->client);
        $this->noAuth = new NoAuthClient($this->client);
        $this->noReqBody = new NoReqBodyClient($this->client);
        $this->reqWithHeaders = new ReqWithHeadersClient($this->client);
        $this->types = new TypesClient($this->client);
    }
}
