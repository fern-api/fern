<?php

namespace Seed\InlinedRequests;

use Seed\InlinedRequests\Requests\PostWithObjectBody;
use Seed\Types\Object\Types\ObjectWithOptionalField;

interface InlinedRequestsClientInterface
{
    /**
     * POST with custom object in request body, response is an object
     *
     * @param PostWithObjectBody $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ObjectWithOptionalField
     */
    public function postWithObjectBodyandResponse(PostWithObjectBody $request, ?array $options = null): ObjectWithOptionalField;
}
