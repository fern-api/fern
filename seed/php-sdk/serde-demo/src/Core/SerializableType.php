<?php

namespace Seed\Core;

use DateTime;
use DateTimeInterface;
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
     */
    public function toJson(): string
    {
        $arrayData = $this->toArray();
        return json_encode($arrayData);
    }

    /**
     * Deserializes a JSON string into an object of the calling class.
     *
     * @param string $json The JSON string to deserialize.
     * @return static
     */
    public static function fromJson(string $json): static
    {
        $arrayData = json_decode($json, true);
        return static::fromArray($arrayData);
    }

    /**
     * Deserializes an array into an object of the calling class.
     *
     * @param array $data The array to deserialize.
     * @return static
     */
    public static function fromArray(array $data): static
    {
        $reflectionClass = new ReflectionClass(static::class);
        $constructor = $reflectionClass->getConstructor();
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

            $jsonKey = static::getJsonKey($property);
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
                    $value = static::deserializeGenericArray($value, $arrayType);
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
            $property->setAccessible(true);
            $jsonKey = static::getJsonKey($property);
            $value = $property->getValue($this);

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
            if ($dateTypeAttr && $value instanceof DateTimeInterface) {
                $dateType = $dateTypeAttr->newInstance()->type;
                if ($dateType === DateType::TYPE_DATE) {
                    $value = $value->format('Y-m-d');
                } else {
                    $value = $value->format(DateTimeInterface::RFC3339);
                }
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = static::serializeGenericArray($value, $arrayType);
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
            $key = self::castKey($key, $keyType);

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

    /**
     * Serializes a list (indexed array) where only the value type is defined.
     *
     * @param array $data The list to serialize.
     * @param array $type The type definition for the list.
     * @return array The serialized list.
     */
    private static function serializeList(array $data, array $type): array
    {
        $valueType = $type[0];

        return array_map(function ($item) use ($valueType) {
            if (is_array($valueType)) {
                return self::serializeGenericArray($item, $valueType);
            } elseif (is_object($item) && method_exists($item, 'toArray')) {
                return $item->toArray();
            } else {
                return $item;
            }
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

    /**
     * Deserializes a map (associative array) where key and value types are defined.
     *
     * @param array $data The associative array to deserialize.
     * @param array $type The type definition for the map.
     * @return array The deserialized map.
     */
    private static function deserializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);
        $valueType = $type[$keyType];
        $result = [];

        foreach ($data as $key => $item) {
            $key = self::castKey($key, $keyType);

            if (is_array($valueType)) {
                $result[$key] = self::deserializeGenericArray($item, $valueType);
            } elseif (class_exists($valueType) && method_exists($valueType, 'fromArray')) {
                $result[$key] = $valueType::fromArray($item);
            } else {
                $result[$key] = $item;
            }
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
    private static function deserializeList(array $data, array $type): array
    {
        $valueType = $type[0];

        return array_map(function ($item) use ($valueType) {
            if (is_array($valueType)) {
                return self::deserializeGenericArray($item, $valueType);
            } elseif (class_exists($valueType) && method_exists($valueType, 'fromArray')) {
                $result = $valueType::fromArray($item);
                return $result;
            } else {
                return $item;
            }
        }, $data);
    }
}