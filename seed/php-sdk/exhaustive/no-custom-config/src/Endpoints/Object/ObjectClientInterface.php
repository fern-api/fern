<?php

namespace Seed\Endpoints\Object;

use Seed\Types\Object\Types\ObjectWithOptionalField;
use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithMapOfMap;
use Seed\Types\Object\Types\NestedObjectWithOptionalField;
use Seed\Types\Object\Types\NestedObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithDatetimeLikeString;

interface ObjectClientInterface
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
     * @return ObjectWithOptionalField
     */
    public function getAndReturnWithOptionalField(ObjectWithOptionalField $request, ?array $options = null): ObjectWithOptionalField;

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
     * @return ObjectWithRequiredField
     */
    public function getAndReturnWithRequiredField(ObjectWithRequiredField $request, ?array $options = null): ObjectWithRequiredField;

    /**
     * @param ObjectWithMapOfMap $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ObjectWithMapOfMap
     */
    public function getAndReturnWithMapOfMap(ObjectWithMapOfMap $request, ?array $options = null): ObjectWithMapOfMap;

    /**
     * @param NestedObjectWithOptionalField $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return NestedObjectWithOptionalField
     */
    public function getAndReturnNestedWithOptionalField(NestedObjectWithOptionalField $request, ?array $options = null): NestedObjectWithOptionalField;

    /**
     * @param string $string
     * @param NestedObjectWithRequiredField $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return NestedObjectWithRequiredField
     */
    public function getAndReturnNestedWithRequiredField(string $string, NestedObjectWithRequiredField $request, ?array $options = null): NestedObjectWithRequiredField;

    /**
     * @param array<NestedObjectWithRequiredField> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return NestedObjectWithRequiredField
     */
    public function getAndReturnNestedWithRequiredFieldAsList(array $request, ?array $options = null): NestedObjectWithRequiredField;

    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param ObjectWithDatetimeLikeString $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ObjectWithDatetimeLikeString
     */
    public function getAndReturnWithDatetimeLikeString(ObjectWithDatetimeLikeString $request, ?array $options = null): ObjectWithDatetimeLikeString;
}
