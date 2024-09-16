<?php

namespace Seed\Commons;

use Seed\Core\RawClient;
use Seed\Commons\Types\TypesClient;

class CommonsClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var TypesClient $types
     */
    public TypesClient $types;

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
