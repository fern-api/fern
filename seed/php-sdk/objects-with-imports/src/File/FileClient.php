<?php

namespace Seed\File;

use Seed\File\Directory\DirectoryClient;
use Seed\Core\RawClient;

class FileClient
{
    /**
     * @var DirectoryClient $directory
     */
    public DirectoryClient $directory;

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
        $this->directory = new DirectoryClient($this->client);
    }
}
