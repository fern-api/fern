<?php

namespace Seed\Endpoints\HttpMethods;

use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithOptionalField;

interface HttpMethodsClientInterface
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
     * @return string
     */
    public function testGet(string $id, ?array $options = null): string;

    /**
     * @param ObjectWithRequiredField $request
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
    public function testPost(ObjectWithRequiredField $request, ?array $options = null): ObjectWithOptionalField;

    /**
     * @param string $id
     * @param ObjectWithRequiredField $request
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
    public function testPut(string $id, ObjectWithRequiredField $request, ?array $options = null): ObjectWithOptionalField;

    /**
     * @param string $id
     * @param ObjectWithOptionalField $request
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
    public function testPatch(string $id, ObjectWithOptionalField $request, ?array $options = null): ObjectWithOptionalField;

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
     * @return bool
     */
    public function testDelete(string $id, ?array $options = null): bool;
}
