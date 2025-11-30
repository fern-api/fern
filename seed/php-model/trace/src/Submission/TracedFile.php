<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TracedFile extends JsonSerializableType
{
    /**
     * @var string $filename
     */
    #[JsonProperty('filename')]
    public string $filename;

    /**
     * @var string $directory
     */
    #[JsonProperty('directory')]
    public string $directory;

    /**
     * @param array{
     *   filename: string,
     *   directory: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->filename = $values['filename'];$this->directory = $values['directory'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
