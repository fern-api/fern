<?php

namespace Seed\Folder;

use Seed\Core\RawClient;
use Seed\Folder\Service\ServiceClient;

class FolderClient
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
