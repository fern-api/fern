<?php

namespace Seed\FolderC;

use Seed\Core\RawClient;
use Seed\FolderC\Common\CommonClient;

class FolderCClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var CommonClient $common
     */
    public CommonClient $common;

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
