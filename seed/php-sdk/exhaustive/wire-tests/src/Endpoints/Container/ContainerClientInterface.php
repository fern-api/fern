<?php

namespace Seed\Endpoints\Container;

use Seed\Types\Object\Types\ObjectWithRequiredField;

interface ContainerClientInterface
{
    /**
     * @param array<string> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<string>
     */
    public function getAndReturnListOfPrimitives(array $request, ?array $options = null): array;

    /**
     * @param array<ObjectWithRequiredField> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<ObjectWithRequiredField>
     */
    public function getAndReturnListOfObjects(array $request, ?array $options = null): array;

    /**
     * @param array<string> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<string>
     */
    public function getAndReturnSetOfPrimitives(array $request, ?array $options = null): array;

    /**
     * @param array<ObjectWithRequiredField> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<ObjectWithRequiredField>
     */
    public function getAndReturnSetOfObjects(array $request, ?array $options = null): array;

    /**
     * @param array<string, string> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<string, string>
     */
    public function getAndReturnMapPrimToPrim(array $request, ?array $options = null): array;

    /**
     * @param array<string, ObjectWithRequiredField> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return array<string, ObjectWithRequiredField>
     */
    public function getAndReturnMapOfPrimToObject(array $request, ?array $options = null): array;

    /**
     * @param ?ObjectWithRequiredField $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?ObjectWithRequiredField
     */
    public function getAndReturnOptional(?ObjectWithRequiredField $request = null, ?array $options = null): ?ObjectWithRequiredField;
}
