<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithBasePropertiesZero extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithBasePropertiesZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?int $value
     */
    #[JsonProperty('value')]
    public ?int $value;

    /**
     * @param array{
     *   type: value-of<UnionWithBasePropertiesZeroType>,
     *   value?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
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
