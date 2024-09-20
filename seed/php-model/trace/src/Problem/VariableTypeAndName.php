<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class VariableTypeAndName extends SerializableType
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
}
