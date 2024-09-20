<?php

namespace Seed\V2\Problem\Types;

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
     * @param array{
     *   parameters: array<Parameter>,
     *   actualResultType: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->actualResultType = $values['actualResultType'];
    }
}
