<?php

namespace Seed\Endpoints\Union;

use Seed\Types\Union\Types\Animal;

interface UnionClientInterface
{
    /**
     * @param Animal $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Animal
     */
    public function getAndReturnUnion(Animal $request, ?array $options = null): Animal;
}
