<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class VariableTypeAndName extends SerializableType
{
    /**
     * @var mixed $variableType
     */
    #[JsonProperty("variableType")]
    public mixed $variableType;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
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
