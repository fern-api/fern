<?php

namespace Seed\FolderC;

use Seed\FolderC\Common\CommonClient;
use Seed\Core\RawClient;

class FolderCClient
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
