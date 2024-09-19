<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TracedFile extends SerializableType
{
    /**
     * @var string $filename
     */
    #[JsonProperty("filename")]
    public string $filename;

    /**
     * @var string $directory
     */
    #[JsonProperty("directory")]
    public string $directory;

    /**
     * @param string $filename
     * @param string $directory
     */
    public function __construct(
        string $filename,
        string $directory,
    ) {
        $this->filename = $filename;
        $this->directory = $directory;
    }
}
