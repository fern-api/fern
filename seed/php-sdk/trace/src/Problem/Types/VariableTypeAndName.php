<?php

namespace Seed\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\VariableType;
use Seed\Core\Json\JsonProperty;

class VariableTypeAndName extends JsonSerializableType
{
    /**
     * @var VariableType $variableType
     */
    #[JsonProperty('variableType')]
    public VariableType $variableType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   variableType: VariableType,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->variableType = $values['variableType'];$this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
