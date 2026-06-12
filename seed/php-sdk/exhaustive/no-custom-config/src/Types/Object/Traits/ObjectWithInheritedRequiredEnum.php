<?php

namespace Seed\Types\Object\Traits;

use Seed\Types\Enum\Types\WeatherReport;
use Seed\Core\Json\JsonProperty;

/**
 * A base object that has a required enum field, preventing Default derive
 * in Rust because enums don't implement Default.
 *
 * @property value-of<WeatherReport> $requiredEnum
 * @property string $requiredString
 */
trait ObjectWithInheritedRequiredEnum
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
}
