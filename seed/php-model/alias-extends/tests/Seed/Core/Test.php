<?php

namespace Seed\Core;

use PHPUnit\Framework\TestCase;
use Seed\WeatherReport;

class Test extends TestCase
{
    public function test(): void {
        $cloudy = WeatherReport::CLOUDY();
        $other = WeatherReport::SOMETHING_ELSE();
    }
}