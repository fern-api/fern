<?php

namespace Seed\Endpoints;

use Seed\Endpoints\Container\ContainerClient;
use Seed\Endpoints\ContentType\ContentTypeClient;
use Seed\Endpoints\Enum\EnumClient;
use Seed\Endpoints\HttpMethods\HttpMethodsClient;
use Seed\Endpoints\Object\ObjectClient;
use Seed\Endpoints\Params\ParamsClient;
use Seed\Endpoints\Primitive\PrimitiveClient;
use Seed\Endpoints\Union\UnionClient;
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
     * @var UnionClient $union
     */
    public UnionClient $union;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->container = new ContainerClient($this->client);
        $this->contentType = new ContentTypeClient($this->client);
        $this->enum = new EnumClient($this->client);
        $this->httpMethods = new HttpMethodsClient($this->client);
        $this->object = new ObjectClient($this->client);
        $this->params = new ParamsClient($this->client);
        $this->primitive = new PrimitiveClient($this->client);
        $this->union = new UnionClient($this->client);
    }
}
