<?php

namespace Fern\Core\Types;

use ReflectionClass;
use ReflectionException;
use ReflectionIntersectionType;
use ReflectionNamedType;
use ReflectionProperty;
use ReflectionUnionType;

/**
 * @internal
 */
class TypeFactory
{
    /**
     * @template T of object
     * @param class-string<T> $className
     * @return T
     */
    public static function createInstanceWithDefaults(string $className)
    {
        try {
            $reflectionClass = new ReflectionClass($className);
            $args = [];
            $values = [];

            $properties = $reflectionClass->getProperties(ReflectionProperty::IS_PUBLIC);
            foreach ($properties as $property) {
                /** @var ReflectionNamedType|ReflectionUnionType|ReflectionIntersectionType|null $type */
                $type = $property->getType();
                $name = $property->getName();
                if ($type === null) {
                    continue;
                }
                $values[$name] = TypeFactory::getDefaultValueForType($type);
            }
            $args[0] = $values;

            /** @var T|null $instance */
            $instance = $reflectionClass->newInstanceArgs($args);
            if ($instance === null) {
                return new $className();
            }
            return $instance;
        } catch (ReflectionException) {
            return new $className();
        }
    }

    private static function getDefaultValueForType(
        null|ReflectionIntersectionType|ReflectionNamedType|ReflectionUnionType $type
    ): mixed {
        if ($type === null) {
            return null;
        }

        if ($type instanceof ReflectionUnionType) {
            foreach ($type->getTypes() as $t) {
                if ($t instanceof ReflectionNamedType) {
                    return TypeFactory::getDefaultValueForType($t);
                }
            }
        }

        if ($type instanceof ReflectionIntersectionType) {
            foreach ($type->getTypes() as $t) {
                if ($t instanceof ReflectionNamedType) {
                    return TypeFactory::getDefaultValueForType($t);
                }
            }
        }

        if ($type instanceof ReflectionNamedType) {
            if ($type->isBuiltin()) {
                if ($type->allowsNull()) {
                    return null;
                }
                return match ($type->getName()) {
                    'int' => 0,
                    'string' => '',
                    'bool' => false,
                    'array' => [],
                    default => null,
                };
            } else {
                /** @var class-string<object> $typeName */
                $typeName = $type->getName();
                return TypeFactory::createInstanceWithDefaults($typeName);
            }
        }

        return null;
    }
}
