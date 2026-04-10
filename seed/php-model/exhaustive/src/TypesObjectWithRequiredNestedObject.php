<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Tests that dynamic snippets recursively construct default objects for
 * required properties whose type is a named object. The nested object's
 * own required properties should also be filled with defaults.
 */
class TypesObjectWithRequiredNestedObject extends JsonSerializableType
{
    /**
     * @var string $requiredString
     */
    #[JsonProperty('requiredString')]
    public string $requiredString;

    /**
     * @var TypesNestedObjectWithRequiredField $requiredObject
     */
    #[JsonProperty('requiredObject')]
    public TypesNestedObjectWithRequiredField $requiredObject;

    /**
     * @param array{
     *   requiredString: string,
     *   requiredObject: TypesNestedObjectWithRequiredField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredString = $values['requiredString'];
        $this->requiredObject = $values['requiredObject'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
