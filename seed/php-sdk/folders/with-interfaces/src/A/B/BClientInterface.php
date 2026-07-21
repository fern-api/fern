<?php

namespace Seed\A\B;

interface BClientInterface
{
    /**
     * Example:
     * ```php
     * $client->foo();
     * ```
     *
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function foo(?array $options = null): void;
}
