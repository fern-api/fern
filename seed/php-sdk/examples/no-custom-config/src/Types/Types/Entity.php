<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\BasicType;
use Seed\Types\ComplexType;
use Seed\Core\Json\JsonProperty;

class Entity extends JsonSerializableType
{
    /**
     * @var (
     *    value-of<BasicType>
     *   |value-of<ComplexType>
     * ) $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   type: (
     *    value-of<BasicType>
     *   |value-of<ComplexType>
     * ),
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
