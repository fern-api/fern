<?php

namespace Seed\Service\Requests;

use Seed\Core\SerializableType;
use Seed\Utils\File;

class JustFileRequet extends SerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @param array{
     *   file: File,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
    }
}
