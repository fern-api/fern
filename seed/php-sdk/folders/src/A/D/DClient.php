<?php

namespace Seed\A\D;

use Seed\Core\RawClient;
use Seed\A\D\Types\TypesClient;

class DClient
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
