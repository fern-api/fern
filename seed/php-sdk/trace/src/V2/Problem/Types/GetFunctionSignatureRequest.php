<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetFunctionSignatureRequest extends SerializableType
{
    #[JsonProperty("functionSignature")]
    /**
     * @var mixed $functionSignature
     */
    public mixed $functionSignature;

    /**
     * @param mixed $functionSignature
     */
    public function __construct(
        mixed $functionSignature,
    ) {
        $this->functionSignature = $functionSignature;
    }
}
