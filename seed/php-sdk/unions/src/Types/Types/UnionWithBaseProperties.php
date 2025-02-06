<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithBaseProperties extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $type
     */
    public readonly string $type;

    /**
     * @var mixed $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   id: string,
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @return mixed
     */
    public function asInteger(): mixed
    {
    }

    /**
     * @return mixed
     */
    public function asString(): mixed
    {
    }

    /**
     * @return mixed
     */
    public function asFoo(): mixed
    {
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
