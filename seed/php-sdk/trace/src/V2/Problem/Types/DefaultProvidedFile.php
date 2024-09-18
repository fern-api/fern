<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\Problem\Types\FileInfoV2;
use Seed\Core\ArrayType;

class DefaultProvidedFile extends SerializableType
{
    #[JsonProperty("file")]
    /**
     * @var FileInfoV2 $file
     */
    public FileInfoV2 $file;

    #[JsonProperty("relatedTypes"), ArrayType(["mixed"])]
    /**
     * @var array<mixed> $relatedTypes
     */
    public array $relatedTypes;

    /**
     * @param FileInfoV2 $file
     * @param array<mixed> $relatedTypes
     */
    public function __construct(
        FileInfoV2 $file,
        array $relatedTypes,
    ) {
        $this->file = $file;
        $this->relatedTypes = $relatedTypes;
    }
}
