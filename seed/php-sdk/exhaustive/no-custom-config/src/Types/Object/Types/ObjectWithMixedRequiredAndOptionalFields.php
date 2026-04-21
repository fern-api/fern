<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Tests that dynamic snippets include all required properties even when
 * the example data only provides a subset. In C#, properties marked as
 * `required` must be set in the object initializer.
 */
class ObjectWithMixedRequiredAndOptionalFields extends JsonSerializableType
{
    /**
     * @var string $requiredString
     */
    #[JsonProperty('requiredString')]
    public string $requiredString;

    /**
     * @var int $requiredInteger
     */
    #[JsonProperty('requiredInteger')]
    public int $requiredInteger;

    /**
     * @var ?string $optionalString
     */
    #[JsonProperty('optionalString')]
    public ?string $optionalString;

    /**
     * @var int $requiredLong
     */
    #[JsonProperty('requiredLong')]
    public int $requiredLong;

    /**
     * @param array{
     *   requiredString: string,
     *   requiredInteger: int,
     *   requiredLong: int,
     *   optionalString?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredString = $values['requiredString'];
        $this->requiredInteger = $values['requiredInteger'];
        $this->optionalString = $values['optionalString'] ?? null;
        $this->requiredLong = $values['requiredLong'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
