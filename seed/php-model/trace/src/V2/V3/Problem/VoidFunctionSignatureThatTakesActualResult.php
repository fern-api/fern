<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\V3\Problem\Parameter;

class VoidFunctionSignatureThatTakesActualResult extends SerializableType
{
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    /**
     * @var array<Parameter> $parameters
     */
    public array $parameters;

    #[JsonProperty("actualResultType")]
    /**
     * @var mixed $actualResultType
     */
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
