<?php

namespace Seed\A\C;

interface CClientInterface
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
