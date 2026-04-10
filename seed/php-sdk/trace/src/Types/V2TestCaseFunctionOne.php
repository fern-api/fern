<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2VoidFunctionDefinition;
use Seed\Core\Json\JsonProperty;

class V2TestCaseFunctionOne extends JsonSerializableType
{
    use V2VoidFunctionDefinition;

    /**
     * @var value-of<V2TestCaseFunctionOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     *   code: V2FunctionImplementationForMultipleLanguages,
     *   type: value-of<V2TestCaseFunctionOneType>,
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
