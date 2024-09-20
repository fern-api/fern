<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DefaultProvidedFile extends SerializableType
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
}
