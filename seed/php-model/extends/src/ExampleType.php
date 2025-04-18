<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Docs;
use Seed\Core\Json\JsonProperty;

class ExampleType extends JsonSerializableType
{
    use Docs;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   docs: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->docs = $values['docs'];
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
