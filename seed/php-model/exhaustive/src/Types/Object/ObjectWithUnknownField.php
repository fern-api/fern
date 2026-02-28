<?php

namespace Seed\Types\Object;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Tests that unknown/any values containing backslashes in map keys
 * are properly escaped in Go string literals.
 */
class ObjectWithUnknownField extends JsonSerializableType
{
    /**
     * @var mixed $unknown
     */
    #[JsonProperty('unknown')]
    public mixed $unknown;

    /**
     * @param array{
     *   unknown: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->unknown = $values['unknown'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
