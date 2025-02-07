<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;

class Shape extends JsonSerializableType
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
     * @return Circle
     */
    public function asCircle(): Circle
    {
        if (!($this->value instanceof Circle)) {
            throw new Exception(
                "Unexpected value type",
            );
        }

        return $this->value;
    }

    /**
     * @return Square
     */
    public function asSquare(): Square
    {
        if (!($this->value instanceof Square)) {
            throw new Exception(
                "Unexpected value type",
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
