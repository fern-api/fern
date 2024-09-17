<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class VariableTypeAndName extends SerializableType
{
    #[JsonProperty("variableType")]
    /**
     * @var mixed $variableType
     */
    public mixed $variableType;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param mixed $variableType
     * @param string $name
     */
    public function __construct(
        mixed $variableType,
        string $name,
    ) {
        $this->variableType = $variableType;
        $this->name = $name;
    }
}
