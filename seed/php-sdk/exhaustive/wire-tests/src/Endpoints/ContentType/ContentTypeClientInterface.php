<?php

namespace Seed\Endpoints\ContentType;

use Seed\Types\Object\Types\ObjectWithOptionalField;

interface ContentTypeClientInterface
{
    /**
     * @param ObjectWithOptionalField $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function postJsonPatchContentType(ObjectWithOptionalField $request, ?array $options = null): void;

    /**
     * @param ObjectWithOptionalField $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function postJsonPatchContentWithCharsetType(ObjectWithOptionalField $request, ?array $options = null): void;
}
