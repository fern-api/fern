<?php

namespace Seed\A\D;

use Seed\A\D\Types\TypesClient;
use Seed\Core\RawClient;

class DClient
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
