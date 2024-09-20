<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetFunctionSignatureRequest extends SerializableType
{
    /**
     * @var mixed $functionSignature
     */
    #[JsonProperty('functionSignature')]
    public mixed $functionSignature;

    /**
     * @param array{
     *   functionSignature: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->functionSignature = $values['functionSignature'];
    }
}
