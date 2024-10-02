<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Traits\Json;
use Seed\Core\JsonProperty;

class NestedType extends SerializableType
{
    use Json;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   name: string,
     *   raw: string,
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->raw = $values['raw'];
        $this->docs = $values['docs'];
    }
}
