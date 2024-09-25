<?php

namespace Seed\Service\Requests;

use Seed\Utils\File;
use Seed\Service\Types\MyObject;

class WithContentTypeRequest
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var string $foo
     */
    public string $foo;

    /**
     * @var MyObject $bar
     */
    public MyObject $bar;

    /**
     * @param array{
     *   file: File,
     *   foo: string,
     *   bar: MyObject,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
    }
}
