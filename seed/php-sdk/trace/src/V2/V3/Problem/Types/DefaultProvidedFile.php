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
    #[JsonProperty("file")]
    public FileInfoV2 $file;

    /**
     * @var array<mixed> $relatedTypes
     */
    #[JsonProperty("relatedTypes"), ArrayType(["mixed"])]
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
