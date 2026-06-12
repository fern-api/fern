<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Tests that a struct with a required field whose type extends a non-Default
 * base type does NOT incorrectly derive Default in Rust. Reproduces the bug
 * where namedTypeSupportsDefault only checked properties but not extends.
 */
class ObjectWithRequiredExtendedField extends JsonSerializableType
{
    /**
     * @var ExtendedObjectWithInheritedEnum $requiredExtended
     */
    #[JsonProperty('requiredExtended')]
    public ExtendedObjectWithInheritedEnum $requiredExtended;

    /**
     * @param array{
     *   requiredExtended: ExtendedObjectWithInheritedEnum,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredExtended = $values['requiredExtended'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
