<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DiscriminatedLiteralDefaultName extends JsonSerializableType
{
    /**
     * @var ?value-of<DiscriminatedLiteralDefaultNameValue> $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   value?: ?value-of<DiscriminatedLiteralDefaultNameValue>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
