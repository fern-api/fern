<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Parameter extends SerializableType
{
    #[JsonProperty("parameterId")]
    /**
     * @var string $parameterId
     */
    public string $parameterId;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("variableType")]
    /**
     * @var mixed $variableType
     */
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
