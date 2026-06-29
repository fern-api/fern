<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Enum\Types\WeatherReport;
use Seed\Core\Json\JsonProperty;

/**
 * A base object that has a required enum field, preventing Default derive
 * in Rust because enums don't implement Default.
 */
class ObjectWithInheritedRequiredEnum extends JsonSerializableType
{
    /**
     * @var value-of<WeatherReport> $requiredEnum
     */
    #[JsonProperty('requiredEnum')]
    public string $requiredEnum;

    /**
     * @var string $requiredString
     */
    #[JsonProperty('requiredString')]
    public string $requiredString;

    /**
     * @param array{
     *   requiredEnum: value-of<WeatherReport>,
     *   requiredString: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredEnum = $values['requiredEnum'];
        $this->requiredString = $values['requiredString'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
