<?php

namespace Seed\Commons;

use Seed\Core\RawClient;
use Seed\Commons\Metadata\MetadataClient;

class CommonsClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var MetadataClient $metadata
     */
    public MetadataClient $metadata;

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
