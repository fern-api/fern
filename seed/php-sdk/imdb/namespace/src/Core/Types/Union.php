<?php

namespace Fern\Core\Types;

use Attribute;

/**
 * Union type attribute for flexible type declarations.
 *
 * This class is used to define a union of multiple types for a property.
 * It allows a property to accept one of several types, including strings, arrays, or other Union types.
 * This class supports complex types, nested unions, and arrays, providing a flexible mechanism for property type validation and serialization.
 *
 * Example:
 *
 * ```php
 * #[Union('string', 'int', 'null', new Union('boolean', 'float'))]
 * private mixed $property;
 * ```
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
class Union
{
    /**
     * @var array<string|Union|array<mixed>> The types allowed for this property, which can be strings, arrays, or nested Union types.
     */
    public array $types;

    /**
     * Constructor for the Union attribute.
     *
     * @param string|Union|array<mixed> ...$types The list of types that the property can accept.
     * This can include primitive types (e.g., 'string', 'int'), arrays, or other Union instances.
     *
     * Example:
     * ```php
     * #[Union('string', 'null', 'date', new Union('boolean', 'int'))]
     * ```
     */
    public function __construct(string|Union|array ...$types)
    {
        $this->types = $types;
    }

    /**
     * Converts the Union type to a string representation.
     *
     * @return string A string representation of the union types.
     */
    public function __toString(): string
    {
        return implode(' | ', array_map(function ($type) {
            if (is_string($type)) {
                return $type;
            } elseif ($type instanceof Union) {
                return (string) $type; // Recursively handle nested unions
            } elseif (is_array($type)) {
                return 'array'; // Handle arrays
            }
        }, $this->types));
    }
}