<?php

namespace Seed\FolderB;

use Seed\FolderB\Common\CommonClient;
use Seed\Core\RawClient;

class FolderBClient
{
    /**
     * @var CommonClient $common
     */
    public CommonClient $common;

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
        $this->common = new CommonClient($this->client);
    }
}
