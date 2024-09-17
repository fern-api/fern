<?php

namespace Seed\User\Events;

use Seed\Core\RawClient;
use Seed\User\Events\Metadata\MetadataClient;

class EventsClient
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
