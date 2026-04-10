<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3VoidFunctionDefinition;
use Seed\Core\Json\JsonProperty;

class V2V3TestCaseFunctionOne extends JsonSerializableType
{
    use V2V3VoidFunctionDefinition;

    /**
     * @var value-of<V2V3TestCaseFunctionOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
     *   code: V2V3FunctionImplementationForMultipleLanguages,
     *   type: value-of<V2V3TestCaseFunctionOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
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
