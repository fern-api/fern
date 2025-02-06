<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariableTypeAndName extends JsonSerializableType
{
    /**
     * @var mixed $variableType
     */
    #[JsonProperty('variableType')]
    public mixed $variableType;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   variableType: mixed,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->variableType = $values['variableType'];
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
