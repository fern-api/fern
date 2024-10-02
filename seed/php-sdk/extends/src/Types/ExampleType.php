<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Traits\Docs;
use Seed\Core\JsonProperty;

class ExampleType extends SerializableType
{
    use Docs;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   name: string,
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->docs = $values['docs'];
    }
}
