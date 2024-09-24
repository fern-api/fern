<?php

namespace Seed;

use InvalidArgumentException;

class WeatherReport
{
    /**
     * @var array<string, WeatherReport>
     */
    private static array $definitions = [];

    private function __construct(private string $value) {}

    public static function SUNNY(): self
    {
        return WeatherReport::$definitions['SUNNY'] ??= new WeatherReport('SUNNY');
    }

    public static function CLOUDY(): self
    {
        return WeatherReport::$definitions['CLOUDY'] ??= new WeatherReport('CLOUDY');
    }

    /**
     * @param string $name
     * @param mixed[] $arguments
     * @return self
     */
    public static function __callStatic(string $name, array $arguments): self
    {
        return WeatherReport::$definitions[$name] ??= new WeatherReport($name);
    }

    public function __get(string $name): string
    {
        if ($name !== 'value') {
            throw new InvalidArgumentException('Unknown property: '.$name);
        }

        return $this->value;
    }

    public function getValue(): string
    {
        return $this->value;
    }
}