<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FunctionImplementation extends SerializableType
{
    /**
     * @var string $impl
     */
    #[JsonProperty("impl")]
    public string $impl;

    /**
     * @var ?string $imports
     */
    #[JsonProperty("imports")]
    public ?string $imports;

    /**
     * @param string $impl
     * @param ?string $imports
     */
    public function __construct(
        string $impl,
        ?string $imports = null,
    ) {
        $this->impl = $impl;
        $this->imports = $imports;
    }
}
