<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3VoidFunctionSignature;
use Seed\Core\Json\JsonProperty;

class V2V3FunctionSignatureZero extends JsonSerializableType
{
    use V2V3VoidFunctionSignature;

    /**
     * @var value-of<V2V3FunctionSignatureZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
     *   type: value-of<V2V3FunctionSignatureZeroType>,
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
