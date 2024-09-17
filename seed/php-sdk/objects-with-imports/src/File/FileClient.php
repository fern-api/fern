<?php

namespace Seed\File;

use Seed\Core\RawClient;
use Seed\File\Directory\DirectoryClient;

class FileClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var DirectoryClient $directory
     */
    public DirectoryClient $directory;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->directory = new DirectoryClient($this->client);
    }
}
