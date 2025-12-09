<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FunctionImplementation extends JsonSerializableType
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
    )
    {
        $this->impl = $values['impl'];$this->imports = $values['imports'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
