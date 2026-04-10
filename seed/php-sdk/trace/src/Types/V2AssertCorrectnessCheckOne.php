<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2VoidFunctionDefinitionThatTakesActualResult;
use Seed\Core\Json\JsonProperty;

class V2AssertCorrectnessCheckOne extends JsonSerializableType
{
    use V2VoidFunctionDefinitionThatTakesActualResult;

    /**
     * @var value-of<V2AssertCorrectnessCheckOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   additionalParameters: array<V2Parameter>,
     *   code: V2FunctionImplementationForMultipleLanguages,
     *   type: value-of<V2AssertCorrectnessCheckOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->additionalParameters = $values['additionalParameters'];
        $this->code = $values['code'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
