<?php

namespace Seed\Core;

use DateTime;
use Exception;
use InvalidArgumentException;
use ReflectionProperty;
use Seed\Core\SerializableType\UnionArrayType;

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
        return json_encode($arrayData, JSON_THROW_ON_ERROR);
    }

    /**
     * Serializes the object to an array for JSON encoding.
     *
     * @return array
     */
    public function toArray(): array
    {
        $result = [];
        $reflectionClass = new \ReflectionClass($this);

        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = self::getJsonKey($property);
            $value = $property->getValue($this);

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
            if ($dateTypeAttr && $value instanceof DateTime) {
                $dateType = $dateTypeAttr->newInstance()->type;
                $value = ($dateType === DateType::TYPE_DATE)
                    ? $value->format(Constant::DateFormat)
                    : $value->format(Constant::DateTimeFormat);
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = self::serializeGenericArray($value, $arrayType);
            }

            if ($value !== null) {
                $result[$jsonKey] = $value;
            }
        }

        return $result;
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
     * Serializes a value based on the type definition.
     *
     * @param mixed $data The value to serialize.
     * @param mixed $type The type definition.
     * @return mixed The serialized value.
     */
    private static function serializeValue($data, $type)
    {
        if ($type instanceof Union) {
            foreach ($type->types as $unionType) {
                try {
                    return self::serializeSingleValue($data, $unionType);
                } catch (Exception $e) {
                    continue;
                }
            }
            throw new \InvalidArgumentException("Cannot serialize value with any of the union types.");
        }

        return self::serializeSingleValue($data, $type);
    }

    /**
     * Serializes a single value based on its type.
     *
     * @param mixed $data The value to serialize.
     * @param string $type The expected type.
     * @return mixed The serialized value.
     */
    private static function serializeSingleValue(mixed $data, mixed $type): mixed
    {
        if (is_array($type)) {
            return self::serializeGenericArray($data, $type);
        }
        if ($type === 'null' && $data === null) {
            return null;
        }

        if (($type === 'date' || $type === 'datetime') && $data instanceof DateTime) {
            return $type === 'date' ? $data->format(Constant::DateFormat) : $data->format(Constant::DateTimeFormat);
        }

        if (class_exists($type) && $data instanceof $type) {
            if (method_exists($data, 'toArray')) {
                return $data->toArray();
            } else {
                throw new \InvalidArgumentException("Class $type must implement toArray method.");
            }
        }

        if (gettype($data) === $type) {
            return $data;
        }

        throw new \InvalidArgumentException("Unable to serialize value of type '" . gettype($data) . "' as '$type'.");
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
            $result[$key] = self::serializeValue($item, $valueType);
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
        return array_map(fn($item) => self::serializeValue($item, $valueType), $data);
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
     * @param string $keyType The type to cast the key to ('string', 'integer', 'float').
     * @return mixed The casted key.
     */
    private static function castKey(mixed $key, string $keyType): mixed
    {
        return match ($keyType) {
            'integer' => (int)$key,
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
     * Deserializes a JSON string into an object of the calling class.
     *
     * @param string $json The JSON string to deserialize.
     * @return static
     */
    public static function fromJson(string $json): static
    {
        $arrayData = json_decode($json, true, 512, JSON_THROW_ON_ERROR);

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
     */
    public static function fromArray(array $data): static
    {
        $reflectionClass = new \ReflectionClass(static::class);
        $constructor = $reflectionClass->getConstructor();
        $parameters = $constructor->getParameters();
        $args = [];

        foreach ($parameters as $parameter) {
            $propertyName = $parameter->getName();

            if ($reflectionClass->hasProperty($propertyName)) {
                $property = $reflectionClass->getProperty($propertyName);
            } else {
                continue;
            }

            $jsonKey = self::getJsonKey($property);
            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];

                // Handle DateType annotation
                $dateTypeAttr = $property->getAttributes(DateType::class)[0] ?? null;
                if ($dateTypeAttr) {
                    $dateType = $dateTypeAttr->newInstance()->type;
                    $value = ($dateType === DateType::TYPE_DATE)
                        ? DateTime::createFromFormat(Constant::DeserializationDateFormat, $value)
                        : new DateTime($value);
                }

                // Handle ArrayType annotation
                $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
                if (is_array($value) && $arrayTypeAttr) {
                    $arrayType = $arrayTypeAttr->newInstance()->type;
                    $value = self::deserializeGenericArray($value, $arrayType);
                }

                $args[$parameter->getPosition()] = $value;
            } else {
                $args[$parameter->getPosition()] = $parameter->isDefaultValueAvailable() ? $parameter->getDefaultValue() : null;
            }
        }

        return new static(...$args);
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
     * Deserializes a value based on the type definition.
     *
     * @param mixed $data The data to deserialize.
     * @param array|Union|string $type The type definition.
     * @return mixed The deserialized value.
     */
    private static function deserializeValue(mixed $data, array|Union|string $type): mixed
    {
        if (is_array($type)) {
            return self::deserializeGenericArray((array)$data, $type);
        }
        if ($type instanceof Union) {
            foreach ($type->types as $unionType) {
                try {
                    return self::deserializeSingleValue($data, $unionType);
                } catch (Exception $e) {
                    continue;
                }
            }
            throw new \InvalidArgumentException("Cannot deserialize value with any of the union types.");
        }

        return self::deserializeSingleValue($data, $type);
    }

    /**
     * Deserializes a single value based on its type.
     *
     * @param mixed $data The data to deserialize.
     * @param string $type The expected type.
     * @return mixed The deserialized value.
     */
    private static function deserializeSingleValue(mixed $data, string $type): mixed
    {
        if ($type === 'null' && $data === null) {
            return null;
        }

        if ($type === 'date' && is_string($data)) {
            return DateTime::createFromFormat(Constant::DeserializationDateFormat, $data);
        }

        if ($type === 'datetime' && is_string($data)) {
            return new DateTime($data);
        }

        if (class_exists($type) && is_array($data)) {
            return $type::fromArray($data);
        }

        if (gettype($data) === $type) {
            return $data;
        }

        throw new \InvalidArgumentException("Unable to deserialize value of type '" . gettype($data) . "' as '$type'.");
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
            $key = self::castKey($key, (string)$keyType);
            $result[$key] = self::deserializeValue($item, $valueType);
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
        return array_map(fn($item) => self::deserializeValue($item, $valueType), $data);
    }
}