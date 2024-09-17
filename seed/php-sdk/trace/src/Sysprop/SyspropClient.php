<?php

namespace Seed\Sysprop;

use Seed\Core\RawClient;

class SyspropClient
{
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
    }
}
