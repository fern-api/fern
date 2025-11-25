<?php

namespace Seed\Endpoints;

use Seed\Endpoints\Container\ContainerClient;
use Seed\Endpoints\ContentType\ContentTypeClient;
use Seed\Endpoints\Enum\EnumClient;
use Seed\Endpoints\HttpMethods\HttpMethodsClient;
use Seed\Endpoints\Object\ObjectClient;
use Seed\Endpoints\Params\ParamsClient;
use Seed\Endpoints\Primitive\PrimitiveClient;
use Seed\Endpoints\Put\PutClient;
use Seed\Endpoints\Union\UnionClient;
use Seed\Endpoints\Urls\UrlsClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class EndpointsClient
{
    /**
     * @var ContainerClient $container
     */
    public ContainerClient $container;

    /**
     * @var ContentTypeClient $contentType
     */
    public ContentTypeClient $contentType;

    /**
     * @var EnumClient $enum
     */
    public EnumClient $enum;

    /**
     * @var HttpMethodsClient $httpMethods
     */
    public HttpMethodsClient $httpMethods;

    /**
     * @var ObjectClient $object
     */
    public ObjectClient $object;

    /**
     * @var ParamsClient $params
     */
    public ParamsClient $params;

    /**
     * @var PrimitiveClient $primitive
     */
    public PrimitiveClient $primitive;

    /**
     * @var PutClient $put
     */
    public PutClient $put;

    /**
     * @var UnionClient $union
     */
    public UnionClient $union;

    /**
     * @var UrlsClient $urls
     */
    public UrlsClient $urls;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
        $this->container = new ContainerClient($this->client, $this->options);
        $this->contentType = new ContentTypeClient($this->client, $this->options);
        $this->enum = new EnumClient($this->client, $this->options);
        $this->httpMethods = new HttpMethodsClient($this->client, $this->options);
        $this->object = new ObjectClient($this->client, $this->options);
        $this->params = new ParamsClient($this->client, $this->options);
        $this->primitive = new PrimitiveClient($this->client, $this->options);
        $this->put = new PutClient($this->client, $this->options);
        $this->union = new UnionClient($this->client, $this->options);
        $this->urls = new UrlsClient($this->client, $this->options);
    }
}
