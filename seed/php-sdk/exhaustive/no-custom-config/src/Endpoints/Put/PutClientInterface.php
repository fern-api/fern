<?php

namespace Seed\Endpoints\Put;

use Seed\Endpoints\Put\Types\PutResponse;

interface PutClientInterface
{
    /**
     * @param string $id
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return PutResponse
     */
    public function add(string $id, ?array $options = null): PutResponse;
}
