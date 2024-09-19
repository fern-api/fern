<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Files extends SerializableType
{
    /**
     * @var array<FileInfoV2> $files
     */
    #[JsonProperty("files"), ArrayType([FileInfoV2::class])]
    public array $files;

    /**
     * @param array<FileInfoV2> $files
     */
    public function __construct(
        array $files,
    ) {
        $this->files = $files;
    }
}
