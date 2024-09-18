<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SubmissionFileInfo extends SerializableType
{
    #[JsonProperty("directory")]
    /**
     * @var string $directory
     */
    public string $directory;

    #[JsonProperty("filename")]
    /**
     * @var string $filename
     */
    public string $filename;

    #[JsonProperty("contents")]
    /**
     * @var string $contents
     */
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
