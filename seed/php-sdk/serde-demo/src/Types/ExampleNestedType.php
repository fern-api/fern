<?php

namespace Seed\Types;

use JetBrains\PhpStorm\ArrayShape;

class ExampleNestedType
{
    /** @var int */
    public int $id;

    /** @var string */
    public string $name;

    /**
     * Deserializes an array into an ExampleNestedType object.
     *
     * @param array $data The array to deserialize.
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $instance = new self();
        $instance->id = $data['id'];
        $instance->name = $data['name'];

        return $instance;
    }

    /**
     * Serializes the object to an array for JSON encoding.
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
