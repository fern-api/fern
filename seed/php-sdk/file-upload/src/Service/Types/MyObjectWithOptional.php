<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class MyObjectWithOptional extends JsonSerializableType
{
    /**
     * @var string $prop
     */
    #[JsonProperty('prop')]
    public string $prop;

    /**
     * @var ?string $optionalProp
     */
    #[JsonProperty('optionalProp')]
    public ?string $optionalProp;

    /**
     * @param array{
     *   prop: string,
     *   optionalProp?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->prop = $values['prop'];$this->optionalProp = $values['optionalProp'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
