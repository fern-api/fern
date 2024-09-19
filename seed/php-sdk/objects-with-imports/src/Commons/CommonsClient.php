<?php

namespace Seed\Commons;

use Seed\Commons\Metadata\MetadataClient;
use Seed\Core\RawClient;

class CommonsClient
{
    /**
     * @var MetadataClient $metadata
     */
    public MetadataClient $metadata;

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
        $this->metadata = new MetadataClient($this->client);
    }
}
