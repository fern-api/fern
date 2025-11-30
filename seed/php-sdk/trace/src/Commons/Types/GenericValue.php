<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GenericValue extends JsonSerializableType
{
    /**
     * @var ?string $stringifiedType
     */
    #[JsonProperty('stringifiedType')]
    public ?string $stringifiedType;

    /**
     * @var string $stringifiedValue
     */
    #[JsonProperty('stringifiedValue')]
    public string $stringifiedValue;

    /**
     * @param array{
     *   stringifiedValue: string,
     *   stringifiedType?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->stringifiedType = $values['stringifiedType'] ?? null;$this->stringifiedValue = $values['stringifiedValue'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
