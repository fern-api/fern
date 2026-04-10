<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3VoidFunctionDefinitionThatTakesActualResult;
use Seed\Core\Json\JsonProperty;

class V2V3AssertCorrectnessCheckOne extends JsonSerializableType
{
    use V2V3VoidFunctionDefinitionThatTakesActualResult;

    /**
     * @var value-of<V2V3AssertCorrectnessCheckOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   additionalParameters: array<V2V3Parameter>,
     *   code: V2V3FunctionImplementationForMultipleLanguages,
     *   type: value-of<V2V3AssertCorrectnessCheckOneType>,
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
