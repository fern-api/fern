<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TracedFile extends SerializableType
{
    #[JsonProperty("filename")]
    /**
     * @var string $filename
     */
    public string $filename;

    #[JsonProperty("directory")]
    /**
     * @var string $directory
     */
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
