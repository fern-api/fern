<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\V3\Problem\FileInfoV2;

class Files extends SerializableType
{
    #[JsonProperty("files"), ArrayType([FileInfoV2])]
    /**
     * @var array<FileInfoV2> $files
     */
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
