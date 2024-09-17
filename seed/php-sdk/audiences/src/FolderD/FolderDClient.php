<?php

namespace Seed\FolderD;

use Seed\Core\RawClient;
use Seed\FolderD\Service\ServiceClient;

class FolderDClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var ServiceClient $service
     */
    public ServiceClient $service;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->service = new ServiceClient($this->client);
    }
}
