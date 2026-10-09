<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Object\Traits\ObjectWithInheritedRequiredEnum;
use Seed\Core\Json\JsonProperty;
use Seed\Types\Enum\Types\WeatherReport;

/**
 * Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
 * This type should NOT derive Default in Rust because the parent type
 * has a required enum field.
 */
class ExtendedObjectWithInheritedEnum extends JsonSerializableType
{
    use ObjectWithInheritedRequiredEnum;

    /**
     * @var ?string $optionalDescription
     */
    #[JsonProperty('optionalDescription')]
    public ?string $optionalDescription;

    /**
     * @param array{
     *   requiredEnum: value-of<WeatherReport>,
     *   requiredString: string,
     *   optionalDescription?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredEnum = $values['requiredEnum'];
        $this->requiredString = $values['requiredString'];
        $this->optionalDescription = $values['optionalDescription'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
