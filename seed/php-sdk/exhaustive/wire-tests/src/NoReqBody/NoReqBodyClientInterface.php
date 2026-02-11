<?php

namespace Seed\NoReqBody;

use Seed\Types\Object\Types\ObjectWithOptionalField;

interface NoReqBodyClientInterface
{
    /**
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
    public function getWithNoRequestBody(?array $options = null): ObjectWithOptionalField;

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return string
     */
    public function postWithNoRequestBody(?array $options = null): string;
}
