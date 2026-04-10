<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3VoidFunctionDefinition extends JsonSerializableType
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;

    /**
     * @var V2V3FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2V3FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
     *   code: V2V3FunctionImplementationForMultipleLanguages,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->code = $values['code'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
