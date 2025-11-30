<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Core\Json\JsonProperty;
use Seed\Service\Types\MyObject;

class WithContentTypeRequest extends JsonSerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var MyObject $bar
     */
    #[JsonProperty('bar')]
    public MyObject $bar;

    /**
     * @var ?MyObject $fooBar
     */
    #[JsonProperty('foo_bar')]
    public ?MyObject $fooBar;

    /**
     * @param array{
     *   file: File,
     *   foo: string,
     *   bar: MyObject,
     *   fooBar?: ?MyObject,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->file = $values['file'];$this->foo = $values['foo'];$this->bar = $values['bar'];$this->fooBar = $values['fooBar'] ?? null;
    }
}
