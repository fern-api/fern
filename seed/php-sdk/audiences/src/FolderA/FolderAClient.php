<?php

namespace Seed\FolderA;

use Seed\Core\RawClient;
use Seed\FolderA\Service\ServiceClient;

class FolderAClient
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
