<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class VoidFunctionSignatureThatTakesActualResult extends JsonSerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var mixed $actualResultType
     */
    #[JsonProperty('actualResultType')]
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

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
