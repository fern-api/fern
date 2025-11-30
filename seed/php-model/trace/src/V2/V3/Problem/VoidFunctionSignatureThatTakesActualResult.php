<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Commons\VariableType;

class VoidFunctionSignatureThatTakesActualResult extends JsonSerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var VariableType $actualResultType
     */
    #[JsonProperty('actualResultType')]
    public VariableType $actualResultType;

    /**
     * @param array{
     *   parameters: array<Parameter>,
     *   actualResultType: VariableType,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->parameters = $values['parameters'];$this->actualResultType = $values['actualResultType'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
