<?php

namespace Seed\Types;

use Seed\Types\Enum\EnumClient;
use Seed\Types\Object\ObjectClient;
use Seed\Types\Union\UnionClient;
use Seed\Core\RawClient;

class TypesClient
{
    /**
     * @var EnumClient $enum
     */
    public EnumClient $enum;

    /**
     * @var ObjectClient $object
     */
    public ObjectClient $object;

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
        $this->enum = new EnumClient($this->client);
        $this->object = new ObjectClient($this->client);
        $this->union = new UnionClient($this->client);
    }
}
