<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Parameter extends SerializableType
{
    /**
     * @var string $parameterId
     */
    #[JsonProperty("parameterId")]
    public string $parameterId;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var mixed $variableType
     */
    #[JsonProperty("variableType")]
    public mixed $variableType;

    /**
     * @param string $parameterId
     * @param string $name
     * @param mixed $variableType
     */
    public function __construct(
        string $parameterId,
        string $name,
        mixed $variableType,
    ) {
        $this->parameterId = $parameterId;
        $this->name = $name;
        $this->variableType = $variableType;
    }
}
