<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetFunctionSignatureRequest extends SerializableType
{
    /**
     * @var mixed $functionSignature
     */
    #[JsonProperty("functionSignature")]
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
