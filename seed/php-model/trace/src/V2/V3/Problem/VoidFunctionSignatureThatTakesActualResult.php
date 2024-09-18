<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class VoidFunctionSignatureThatTakesActualResult extends SerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var mixed $actualResultType
     */
    #[JsonProperty("actualResultType")]
    public mixed $actualResultType;

    /**
     * @param array<Parameter> $parameters
     * @param mixed $actualResultType
     */
    public function __construct(
        array $parameters,
        mixed $actualResultType,
    ) {
        $this->parameters = $parameters;
        $this->actualResultType = $actualResultType;
    }
}
