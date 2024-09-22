<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FunctionImplementation extends SerializableType
{
    /**
     * @var string $impl
     */
    #[JsonProperty('impl')]
    public string $impl;

    /**
     * @var ?string $imports
     */
    #[JsonProperty('imports')]
    public ?string $imports;

    /**
     * @param array{
     *   impl: string,
     *   imports?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->impl = $values['impl'];
        $this->imports = $values['imports'] ?? null;
    }
}
