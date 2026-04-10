<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Core\Json\JsonProperty;
use Seed\Types\MyObject;

class ServiceWithFormEncodingRequest extends JsonSerializableType
{
    /**
     * @var ?File $file
     */
    public ?File $file;

    /**
     * @var ?string $foo
     */
    #[JsonProperty('foo')]
    public ?string $foo;

    /**
     * @var ?MyObject $bar
     */
    #[JsonProperty('bar')]
    public ?MyObject $bar;

    /**
     * @param array{
     *   file?: ?File,
     *   foo?: ?string,
     *   bar?: ?MyObject,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->file = $values['file'] ?? null;
        $this->foo = $values['foo'] ?? null;
        $this->bar = $values['bar'] ?? null;
    }
}
