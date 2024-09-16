<?php

namespace Seed\S3;

use Seed\Core\RawClient;

class S3Client
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
