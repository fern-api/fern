<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetFunctionSignatureRequest extends JsonSerializableType
{
    /**
     * @var FunctionSignature $functionSignature
     */
    #[JsonProperty('functionSignature')]
    public FunctionSignature $functionSignature;

    /**
     * @param array{
     *   functionSignature: FunctionSignature,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->functionSignature = $values['functionSignature'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
