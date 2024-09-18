<?php

namespace Seed\A;

use Seed\A\B\BClient;
use Seed\A\C\CClient;
use Seed\A\D\DClient;
use Seed\Core\RawClient;

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
     * @var DClient $d
     */
    public DClient $d;

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
        $this->d = new DClient($this->client);
    }
}
