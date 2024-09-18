<?php

namespace Seed\Types;

class WeatherReport {
    private string $value;

    // Predefined constants as class properties
    public static WeatherReport $SUNNY;
    public static WeatherReport $CLOUDY;
    public static WeatherReport $RAINING;
    public static WeatherReport $SNOWING;

    // Constructor
    private function __construct(string $value) {
        $this->value = $value;
    }

    // Initialize predefined constants
    static {
        self::$SUNNY = new WeatherReport('SUNNY');
        self::$CLOUDY = new WeatherReport('CLOUDY');
        self::$RAINING = new WeatherReport('RAINING');
        self::$SNOWING = new WeatherReport('SNOWING');
    }

    // Create a WeatherReport from a string, allowing unknown values
    public static function fromString(string $value): self {
        return match ($value) {
            'SUNNY' => self::$SUNNY,
            'CLOUDY' => self::$CLOUDY,
            'RAINING' => self::$RAINING,
            'SNOWING' => self::$SNOWING,
            default => new WeatherReport($value), // Handle unknown values
        };
    }

    // Convert to string
    public function __toString(): string {
        return $this->value;
    }

    // Equality check
    public function equals(WeatherReport $other): bool {
        return $this->value === $other->value;
    }
}

WeatherReport::init();