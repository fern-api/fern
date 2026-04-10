<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestAnd extends JsonSerializableType
{
    /**
     * @var ?bool $value
     */
    #[JsonProperty('value')]
    public ?bool $value;

    /**
     * @param array{
     *   value?: ?bool,
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
