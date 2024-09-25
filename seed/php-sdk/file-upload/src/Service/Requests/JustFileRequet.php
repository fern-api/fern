<?php

namespace Seed\Service\Requests;

use Seed\Utils\File;

class JustFileRequet
{
    /**
     * @var File $foo
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
