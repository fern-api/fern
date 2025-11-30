<?php

namespace Seed\Core\Pagination;

use ReflectionClass;
use ReflectionException;
use ReflectionIntersectionType;
use ReflectionNamedType;
use ReflectionUnionType;
use RuntimeException;

/**
 * @internal
 */
class PaginationHelper
{
    /**
     * @template T of object
     * @param class-string<T> $className
     * @return T
     */
    public static function createRequestWithDefaults(string $className)
    {
        return self::createInstanceWithDefaults($className);
    }

    /**
     * Sets a nested property on an object, creating intermediate objects as needed.
     *
     * @template TObject of object
     * @template TValue
     * @param TObject $object The object to set the property on.
     * @param string[] $propertyPath The path to the property, as an array of strings.
     * @param TValue $value The value to set.
     * @return void
     * @internal
     */
    public static function setDeep(mixed $object, array $propertyPath, mixed $value): void
    {
        try {
            /** @var object $current */
            $current = $object;

            foreach ($propertyPath as $i => $part) {
                /* @phpstan-ignore-next-line */
                $reflectionClass = new ReflectionClass($current);

                $reflectionProperty = $reflectionClass->getProperty($part);
                $reflectionProperty->setAccessible(true);
                if ($i === count($propertyPath) - 1) {
                    /* @phpstan-ignore-next-line */
                    $reflectionProperty->setValue($current, $value);
                    return;
                }

                /* @phpstan-ignore-next-line */
                $next = $reflectionProperty->getValue($current);

                if ($next === null) {
                    $propertyType = $reflectionProperty->getType();
                    if ($propertyType === null) {
                        throw new RuntimeException("Property type is null for property '$part' in class '" . $reflectionClass->getName() . "'");
                    }

                    /** @var class-string<object> $nextTypeName */
                    /* @phpstan-ignore-next-line */
                    $nextTypeName = $propertyType->getName();
                    /** @var object $next */
                    $next = self::createInstanceWithDefaults($nextTypeName);
                    /* @phpstan-ignore-next-line */
                    $reflectionProperty->setValue($current, $next);
                }

                $current = $next;
            }
        } catch (ReflectionException $ex) {
            $path = implode('->', $propertyPath);
            throw new RuntimeException("Failed to set deep property at $path", 0, $ex);
        }
    }

    /**
     * @template T of object
     * @param class-string<T> $className
     * @return T
     */
    private static function createInstanceWithDefaults(string $className)
    {
        try {
            $reflectionClass = new ReflectionClass($className);
            $args = [];
            $values = [];

            $properties = $reflectionClass->getProperties();
            foreach ($properties as $property) {
                if ($property->isStatic()) {
                    continue;
                }
                /** @var ReflectionNamedType|ReflectionUnionType|ReflectionIntersectionType|null $type */
                $type = $property->getType();
                $value = self::getDefaultValueForType($type);
                // if something is nullable, don't explicitly pass the null value as a parameter
                if($value === null)
                {
                    continue;
                }

                $values[$property->getName()] = $value;
            }
            $args = [$values];

            /** @var T|null $instance */
            $instance = $reflectionClass->newInstanceArgs($args);
            if ($instance === null) {
                return new $className();
            }
            return $instance;
        } catch (ReflectionException $ex) {
            throw new RuntimeException("Failed create instance of $className", 0, $ex);
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
                    return self::getDefaultValueForType($t);
                }
            }
        }

        if ($type instanceof ReflectionIntersectionType) {
            foreach ($type->getTypes() as $t) {
                if ($t instanceof ReflectionNamedType) {
                    return self::getDefaultValueForType($t);
                }
            }
        }

        if ($type->allowsNull()) {
            return null;
        }

        if ($type instanceof ReflectionNamedType) {
            if ($type->isBuiltin()) {
                return match ($type->getName()) {
                    'int' => 0,
                    'string' => '',
                    'bool' => false,
                    'array' => [],
                    default => null,
                };
            }

            /** @var class-string<object> $typeName */
            $typeName = $type->getName();
            return self::createInstanceWithDefaults($typeName);
        }

        return null;
    }
}
