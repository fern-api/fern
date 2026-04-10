<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2VoidFunctionDefinition extends JsonSerializableType
{
    /**
     * @var array<V2Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2Parameter::class])]
    public array $parameters;

    /**
     * @var V2FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     *   code: V2FunctionImplementationForMultipleLanguages,
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
