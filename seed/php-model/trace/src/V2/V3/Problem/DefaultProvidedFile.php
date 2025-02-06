<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class DefaultProvidedFile extends JsonSerializableType
{
    /**
     * @var FileInfoV2 $file
     */
    #[JsonProperty('file')]
    public FileInfoV2 $file;

    /**
     * @var array<mixed> $relatedTypes
     */
    #[JsonProperty('relatedTypes'), ArrayType(['mixed'])]
    public array $relatedTypes;

    /**
     * @param array{
     *   file: FileInfoV2,
     *   relatedTypes: array<mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->relatedTypes = $values['relatedTypes'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
