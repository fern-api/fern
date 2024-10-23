<?php

namespace Seed\A;

use Seed\A\B\BClient;
use Seed\A\C\CClient;
use Seed\Core\Client\RawClient;

class AClient
{
    /**
     * @var BClient $b
     */
    public BClient $b;

    /**
     * @var CClient $c
     */
    public CClient $c;

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
        $this->b = new BClient($this->client);
        $this->c = new CClient($this->client);
    }
}
