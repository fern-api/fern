<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2VoidFunctionSignature;
use Seed\Core\Json\JsonProperty;

class V2FunctionSignatureZero extends JsonSerializableType
{
    use V2VoidFunctionSignature;

    /**
     * @var value-of<V2FunctionSignatureZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     *   type: value-of<V2FunctionSignatureZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
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
