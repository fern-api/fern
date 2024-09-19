<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SubmissionFileInfo extends SerializableType
{
    /**
     * @var string $directory
     */
    #[JsonProperty("directory")]
    public string $directory;

    /**
     * @var string $filename
     */
    #[JsonProperty("filename")]
    public string $filename;

    /**
     * @var string $contents
     */
    #[JsonProperty("contents")]
    public string $contents;

    /**
     * @param string $directory
     * @param string $filename
     * @param string $contents
     */
    public function __construct(
        string $directory,
        string $filename,
        string $contents,
    ) {
        $this->directory = $directory;
        $this->filename = $filename;
        $this->contents = $contents;
    }
}
