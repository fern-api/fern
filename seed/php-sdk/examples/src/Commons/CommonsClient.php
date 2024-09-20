<?php

namespace Seed\Commons;

use Seed\Commons\Types\TypesClient;
use Seed\Core\RawClient;

class CommonsClient
{
    /**
     * @var TypesClient $types
     */
    public TypesClient $types;

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
        $this->types = new TypesClient($this->client);
    }
}
