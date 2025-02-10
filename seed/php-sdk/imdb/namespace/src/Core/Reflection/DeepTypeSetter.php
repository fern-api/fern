<?php

namespace Fern\Core\Reflection;

use ReflectionClass;
use ReflectionException;
use RuntimeException;

/**
 * @internal
 */
class DeepTypeSetter
{
    /**
     * Sets a nested property on an object, creating intermediate objects as needed.
     *
     * @template TObject of object
     * @template TValue
     * @param TObject $object The object to set the property on.
     * @param string[] $propertyPath The path to the property, as an array of strings.
     * @param TValue $value The value to set.
     * @return void
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
                    $next = TypeFactory::createInstanceWithDefaults($nextTypeName);
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
}
