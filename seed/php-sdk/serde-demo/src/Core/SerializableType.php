<?php

namespace Seed\Core;

use DateTime;
use InvalidArgumentException;
use JsonException;
use LogicException;
use ReflectionClass;
use ReflectionProperty;

/**
 * Abstract class SerializableType
 *
 * Provides generic serialization and deserialization methods.
 */
abstract class SerializableType
{
    /**
     * Serializes the object to a JSON string.
     *
     * @return string
     * @throws JsonException
     */
    public function toJson(): string
    {
        $arrayData = $this->toArray();
        return json_encode($arrayData, JSON_THROW_ON_ERROR);
    }

    /**
     * Deserializes a JSON string into an object of the calling class.
     *
     * @param string $json The JSON string to deserialize.
     * @return static
     *
     * @throws InvalidArgumentException if the JSON is invalid or does not decode to an array.
     */
    public static function fromJson(string $json): static
    {
        $arrayData = json_decode($json, true);

        if (!is_array($arrayData)) {
            throw new InvalidArgumentException('Invalid JSON provided or JSON does not decode to an array.');
        }

        return static::fromArray($arrayData);
    }

    /**
     * Deserializes an array into an object of the calling class.
     *
     * @param array $data The array to deserialize.
     * @return static
     *
     * @throws LogicException if the class does not have a constructor.
     */
    public static function fromArray(array $data): static
    {
        $reflectionClass = new ReflectionClass(static::class);
        $constructor = $reflectionClass->getConstructor();
        if ($constructor === null) {
            throw new LogicException('The class ' . static::class . ' must have a constructor.');
        }
        $parameters = $constructor->getParameters();
        $args = [];

        foreach ($parameters as $parameter) {
            $propertyName = $parameter->getName();

            if ($reflectionClass->hasProperty($propertyName)) {
                $property = $reflectionClass->getProperty($propertyName);
            } else {
                // Skip if the property does not exist
                continue;
            }

            $jsonKey = SerializableType::getJsonKey($property);
            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];

                // Handle DateType annotation
                $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
                if ($dateTypeAttr) {
                    $dateType = $dateTypeAttr->newInstance()->type;
                    if ($dateType === DateType::TYPE_DATE) {
                        $value = DateTime::createFromFormat('Y-m-d', $value);
                    } else {
                        $value = new DateTime($value);
                    }
                }

                // Handle ArrayType annotation
                $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
                if (is_array($value) && $arrayTypeAttr) {
                    $arrayType = $arrayTypeAttr->newInstance()->type;
                    $value = SerializableType::deserializeGenericArray($value, $arrayType);
                }

                $args[$parameter->getPosition()] = $value;
            } else {
                // Use default value if available, else null
                if ($parameter->isDefaultValueAvailable()) {
                    $args[$parameter->getPosition()] = $parameter->getDefaultValue();
                } else {
                    $args[$parameter->getPosition()] = null;
                }
            }
        }

        // Instantiate the object with the collected arguments
        return new static(...$args);
    }

    /**
     * Serializes the object to an array for JSON encoding.
     *
     * @return array
     */
    public function toArray(): array
    {
        $result = [];
        $reflectionClass = new ReflectionClass($this);

        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = SerializableType::getJsonKey($property);
            $value = $property->getValue($this);

            // Skip properties with null values
            if ($value === null) {
                continue;
            }

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
            if ($dateTypeAttr && $value instanceof DateTime) {
                $dateType = $dateTypeAttr->newInstance()->type;
                if ($dateType === DateType::TYPE_DATE) {
                    $value = $value->format('Y-m-d');
                } else {
                    $value = $value->format(DateTime::RFC3339);
                }
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = SerializableType::serializeGenericArray($value, $arrayType);
            }

            $result[$jsonKey] = $value;
        }

        return $result;
    }

    /**
     * Helper function to retrieve the JSON key for a property.
     *
     * @param ReflectionProperty $property
     * @return string
     */
    private static function getJsonKey(ReflectionProperty $property): string
    {
        $jsonPropertyAttr = $property->getAttributes(JsonProperty::class)[0] ?? null;
        return $jsonPropertyAttr ? $jsonPropertyAttr->newInstance()->name : $property->getName();
    }

    /**
     * Casts the key to the appropriate type based on the key type.
     *
     * @param mixed $key The key to be cast.
     * @param string $keyType The type to cast the key to ('string', 'int', 'float').
     * @return mixed The casted key.
     */
    private static function castKey(mixed $key, string $keyType): mixed
    {
        return match ($keyType) {
            'int' => (int)$key,
            'float' => (float)$key,
            'string' => (string)$key,
            default => $key,
        };
    }

    /**
     * Determines if the given type represents a map.
     *
     * @param array $type The type definition from the annotation.
     * @return bool True if the type is a map, false if it's a list.
     */
    private static function isMapType(array $type): bool
    {
        return count($type) === 1 && !array_is_list($type);
    }

    /**
     * Serializes the given array based on the type annotation.
     *
     * @param array $data The array to be serialized.
     * @param array $type The type definition from the annotation.
     * @return array The serialized array.
     */
    private static function serializeGenericArray(array $data, array $type): array
    {
        return self::isMapType($type)
            ? self::serializeMap($data, $type)
            : self::serializeList($data, $type);
    }

    /**
     * Serializes a map (associative array) where key and value types are defined.
     *
     * @param array $data The associative array to serialize.
     * @param array $type The type definition for the map.
     * @return array The serialized map.
     */
    private static function serializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);
        $valueType = $type[$keyType];
        $result = [];

        foreach ($data as $key => $item) {
            $key = SerializableType::castKey($key, $keyType);

            if (is_array($valueType)) {
                $result[$key] = self::serializeGenericArray($item, $valueType);
            } elseif (is_object($item) && method_exists($item, 'toArray')) {
                $result[$key] = $item->toArray();
            } else {
                $result[$key] = $item;
            }
        }

        return $result;
    }

    private static function serializeList(array $data, array $type): array
    {
        $valueTypes = self::parseTypeExpression($type[0]);

        return array_map(function ($item) use ($valueTypes) {
            foreach ($valueTypes as $expectedType) {
                if ($expectedType === 'null' && $item === null) {
                    return null;
                }

                if (($expectedType === 'date' || $expectedType === 'datetime') && $item instanceof DateTime) {
                    $format = $expectedType === 'date' ? 'Y-m-d' : DateTime::RFC3339;
                    return $item->format($format);
                }

                if (class_exists($expectedType) && $item instanceof $expectedType) {
                    if (method_exists($item, 'toArray')) {
                        return $item->toArray();
                    } else {
                        throw new \InvalidArgumentException("Class $expectedType must implement toArray method.");
                    }
                }

                if (gettype($item) === $expectedType) {
                    return $item;
                }
            }

            throw new \InvalidArgumentException("Unable to serialize item of type '" . gettype($item) . "'.");
        }, $data);
    }

    /**
     * Deserializes the given array based on the type annotation.
     *
     * @param array $data The array to be deserialized.
     * @param array $type The type definition from the annotation.
     * @return array The deserialized array.
     */
    private static function deserializeGenericArray(array $data, array $type): array
    {
        return self::isMapType($type)
            ? self::deserializeMap($data, $type)
            : self::deserializeList($data, $type);
    }

    private static function deserializeValue($item, $typeDef)
    {
        if (is_array($typeDef)) {
            // Type definition is an array (complex type like map or list)
            return self::deserializeGenericArray($item, $typeDef);
        } else {
            // Type definition is a string (possibly with union types)
            $valueTypes = self::parseTypeExpression($typeDef);

            foreach ($valueTypes as $expectedType) {
                // Handle 'null' type
                if ($expectedType === 'null' && $item === null) {
                    return null;
                }

                // Handle 'date' and 'datetime' types
                if ($expectedType === 'date' && is_string($item)) {
                    $date = DateTime::createFromFormat('Y-m-d', $item);
                    if ($date !== false) {
                        return $date;
                    }
                } elseif ($expectedType === 'datetime' && is_string($item)) {
                    try {
                        return new DateTime($item);
                    } catch (\Exception $e) {
                        // Invalid datetime
                    }
                }

                // Handle class types
                if (class_exists($expectedType) && is_array($item)) {
                    if (method_exists($expectedType, 'fromArray')) {
                        return $expectedType::fromArray($item);
                    }
                }

                // Handle scalar types using is_* functions
                if (($expectedType === 'int' && is_int($item)) ||
                    ($expectedType === 'bool' && is_bool($item)) ||
                    ($expectedType === 'float' && is_float($item)) ||
                    ($expectedType === 'string' && is_string($item))) {
                    return $item;
                }
            }

            // If no matching type is found, throw an exception
            throw new \InvalidArgumentException("Unable to deserialize value: type mismatch.");
        }
    }

    private static function deserializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);
        $valueTypeDef = $type[$keyType];
        $result = [];

        foreach ($data as $key => $item) {
            $key = SerializableType::castKey($key, (string) $keyType);

            try {
                $deserializedItem = self::deserializeValue($item, $valueTypeDef);
            } catch (\InvalidArgumentException $e) {
                throw new \InvalidArgumentException("Unable to deserialize map item with key '$key': " . $e->getMessage());
            }

            $result[$key] = $deserializedItem;
        }

        return $result;
    }

    /**
     * Deserializes a list (indexed array) where only the value type is defined.
     *
     * @param array $data The list to deserialize.
     * @param array $type The type definition for the list.
     * @return array The deserialized list.
     */
    private static function deserializeList(array $data, array $typeDef): array
    {
        $valueTypes = self::parseTypeDefinition($typeDef[0]);

        return array_map(function ($item) use ($valueTypes) {
            foreach ($valueTypes as $expectedType) {
                // Handle 'null' type
                if ($expectedType === 'null' && $item === null) {
                    return null;
                }

                // Handle 'date' and 'datetime' types
                if ($expectedType === 'date' && is_string($item)) {
                    $date = DateTime::createFromFormat('Y-m-d', $item);
                    if ($date !== false) {
                        return $date;
                    }
                } elseif ($expectedType === 'datetime' && is_string($item)) {
                    try {
                        return new DateTime($item);
                    } catch (\Exception $e) {
                        // Not a valid datetime
                    }
                }

                // Handle class types
                if (class_exists($expectedType) && is_array($item)) {
                    if (method_exists($expectedType, 'fromArray')) {
                        return $expectedType::fromArray($item);
                    }
                }

                // Handle scalar types
                if (in_array($expectedType, ['string', 'int', 'float', 'bool']) && gettype($item) === $expectedType) {
                    return $item;
                }
            }

            // If no matching type is found, throw an exception
            throw new \InvalidArgumentException("Unable to deserialize item in array: type mismatch.");
        }, $data);
    }

    /**
     * @param $type
     * @return array|string[]
     */
    private static function parseTypeDefinition($type)
    {
        if (is_array($type)) {
            $parsed = [];
            foreach ($type as $key => $value) {
                // Parse the key
                if (is_string($key)) {
                    $parsedKeys = self::parseTypeExpression($key); // This is an array of types
                } else {
                    $parsedKeys = [null];
                }
                // Parse the value
                $parsedValue = self::parseTypeDefinition($value);

                foreach ($parsedKeys as $parsedKey) {
                    if ($parsedKey !== null) {
                        $parsed[$parsedKey] = $parsedValue;
                    } else {
                        $parsed[] = $parsedValue;
                    }
                }
            }
            return $parsed;
        } else {
            return self::parseTypeExpression($type);
        }
    }

    /**
     * @param string $typeExpr
     * @return array<string>
     */
    private static function parseTypeExpression(string $typeExpr): array
    {
        // Split the type expression by '|' to handle union types
        return array_map('trim', explode('|', $typeExpr));
    }
}