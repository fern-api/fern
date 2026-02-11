<?php

namespace Seed\ReqWithHeaders;

use Seed\ReqWithHeaders\Requests\ReqWithHeaders;

interface ReqWithHeadersClientInterface
{
    /**
     * @param ReqWithHeaders $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function getWithCustomHeader(ReqWithHeaders $request, ?array $options = null): void;
}
