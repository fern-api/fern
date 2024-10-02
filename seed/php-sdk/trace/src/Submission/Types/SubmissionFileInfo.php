<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class SubmissionFileInfo extends SerializableType
{
    /**
     * @var string $directory
     */
    #[JsonProperty('directory')]
    public string $directory;

    /**
     * @var string $filename
     */
    #[JsonProperty('filename')]
    public string $filename;

    /**
     * @var string $contents
     */
    #[JsonProperty('contents')]
    public string $contents;

    /**
     * @param array{
     *   directory: string,
     *   filename: string,
     *   contents: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->directory = $values['directory'];
        $this->filename = $values['filename'];
        $this->contents = $values['contents'];
    }
}
