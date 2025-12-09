<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\VariableType;
use Seed\Core\Types\ArrayType;

class DefaultProvidedFile extends JsonSerializableType
{
    /**
     * @var FileInfoV2 $file
     */
    #[JsonProperty('file')]
    public FileInfoV2 $file;

    /**
     * @var array<VariableType> $relatedTypes
     */
    #[JsonProperty('relatedTypes'), ArrayType([VariableType::class])]
    public array $relatedTypes;

    /**
     * @param array{
     *   file: FileInfoV2,
     *   relatedTypes: array<VariableType>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->file = $values['file'];$this->relatedTypes = $values['relatedTypes'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
