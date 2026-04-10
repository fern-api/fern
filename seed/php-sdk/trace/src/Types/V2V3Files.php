<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3Files extends JsonSerializableType
{
    /**
     * @var array<V2V3FileInfoV2> $files
     */
    #[JsonProperty('files'), ArrayType([V2V3FileInfoV2::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<V2V3FileInfoV2>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
