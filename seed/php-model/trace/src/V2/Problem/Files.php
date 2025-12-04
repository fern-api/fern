<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Files extends JsonSerializableType
{
    /**
     * @var array<FileInfoV2> $files
     */
    #[JsonProperty('files'), ArrayType([FileInfoV2::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<FileInfoV2>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->files = $values['files'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
