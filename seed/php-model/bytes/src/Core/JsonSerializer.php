<?php

namespace Seed\Core;

use DateTime;
use Exception;
use JsonException;
use JsonSerializable;

class JsonSerializer
{
    /**
     * Serializes a DateTime object into a string using the date format.
     *
     * @param DateTime $date The DateTime object to serialize.
     * @return string The serialized date string.
     */
    public static function serializeDate(DateTime $date): string
    {
        return $date->format(Constant::DateFormat);
    }

    /**
     * Serializes a DateTime object into a string using the date-time format.
     *
     * @param DateTime $date The DateTime object to serialize.
     * @return string The serialized date-time string.
     */
    public static function serializeDateTime(DateTime $date): string
    {
        return $date->format(Constant::DateTimeFormat);
    }

    /**
     * Serializes an array based on type annotations (either a list or map).
     *
     * @param mixed[]|array<string, mixed> $data The array to be serialized.
     * @param mixed[]|array<string, mixed> $type The type definition from the annotation.
     * @return mixed[]|array<string, mixed> The serialized array.
     * @throws JsonException If serialization fails.
     */
    public static function serializeArray(array $data, array $type): array
    {
        return Utils::isMapType($type)
            ? self::serializeMap($data, $type)
            : self::serializeList($data, $type);
    }

    /**
     * Serializes a value based on its type definition.
     *
     * @param mixed $data The value to serialize.
     * @param mixed $type The type definition.
     * @return mixed The serialized value.
     * @throws JsonException If serialization fails.
     */
    private static function serializeValue(mixed $data, mixed $type): mixed
    {
        if ($type instanceof Union) {
            foreach ($type->types as $unionType) {
                try {
                    return self::serializeSingleValue($data, $unionType);
                } catch (Exception) {
                    continue;
                }
            }
            throw new JsonException("Cannot serialize value with any of the union types.");
        }

        if (is_array($type)) {
            return self::serializeArray((array)$data, $type);
        }

        if (gettype($type) != "string") {
            throw new JsonException("Unexpected non-string type.");
        }

        return self::serializeSingleValue($data, $type);
    }

    /**
     * Serializes a single value based on its type.
     *
     * @param mixed $data The value to serialize.
     * @param string $type The expected type.
     * @return mixed The serialized value.
     * @throws JsonException If serialization fails.
     */
    private static function serializeSingleValue(mixed $data, string $type): mixed
    {
        if ($type === 'null' && $data === null) {
            return null;
        }

        if (($type === 'date' || $type === 'datetime') && $data instanceof DateTime) {
            return $type === 'date' ? self::serializeDate($data) : self::serializeDateTime($data);
        }

        if ($type === 'mixed') {
            return $data;
        }

        if (class_exists($type) && $data instanceof $type) {
            return self::serializeObject($data);
        }

        if (gettype($data) === $type) {
            return $data;
        }

        throw new JsonException("Unable to serialize value of type '" . gettype($data) . "' as '$type'.");
    }

    /**
     * Serializes an object to a JSON-serializable format.
     *
     * @param object $data The object to serialize.
     * @return mixed The serialized data.
     * @throws JsonException If the object does not implement JsonSerializable.
     */
    public static function serializeObject(object $data): mixed
    {
        if (!is_subclass_of($data, JsonSerializable::class)) {
            $type = get_class($data);
            throw new JsonException("Class $type must implement JsonSerializable.");
        }
        return $data->jsonSerialize();
    }

    /**
     * Serializes a map (associative array) with defined key and value types.
     *
     * @param array<string, mixed> $data The associative array to serialize.
     * @param array<string, mixed> $type The type definition for the map.
     * @return array<string, mixed> The serialized map.
     * @throws JsonException If serialization fails.
     */
    private static function serializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);
        if ($keyType === null) {
            throw new JsonException("Unexpected no key in ArrayType.");
        }
        $valueType = $type[$keyType];
        $result = [];

        foreach ($data as $key => $item) {
            $key = Utils::castKey($key, $keyType);
            $result[$key] = self::serializeValue($item, $valueType);
        }

        return $result;
    }

    /**
     * Serializes a list (indexed array) where only the value type is defined.
     *
     * @param array<int, mixed> $data The list to serialize.
     * @param array<int, mixed> $type The type definition for the list.
     * @return array<int, mixed> The serialized list.
     * @throws JsonException If serialization fails.
     */
    private static function serializeList(array $data, array $type): array
    {
        $valueType = $type[0];
        return array_map(fn ($item) => self::serializeValue($item, $valueType), $data);
    }
}
