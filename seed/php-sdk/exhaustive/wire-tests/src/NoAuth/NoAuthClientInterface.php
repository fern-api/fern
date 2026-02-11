<?php

namespace Seed\NoAuth;

interface NoAuthClientInterface
{
    /**
     * POST request with no auth
     *
     * @param mixed $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return bool
     */
    public function postWithNoAuth(mixed $request, ?array $options = null): bool;
}
