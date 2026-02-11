<?php

namespace Seed\Endpoints\Enum;

use Seed\Types\Enum\Types\WeatherReport;

interface EnumClientInterface
{
    /**
     * @param value-of<WeatherReport> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return value-of<WeatherReport>
     */
    public function getAndReturnEnum(string $request, ?array $options = null): string;
}
