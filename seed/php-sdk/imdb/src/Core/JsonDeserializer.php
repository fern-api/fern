<?php

namespace Seed\Core;

use DateTime;
use Exception;
use JsonException;

class JsonDeserializer
{
    /**
     * @throws JsonException
     */
    public static function deserializeDateTime(string $datetime): DateTime
    {
        try {
            return new DateTime($datetime);
        } catch (Exception $e) {
            throw new JsonException("Failed to create DateTime from string: $datetime", previous: $e);
        }
    }

    /**
     * @throws JsonException
     */
    public static function deserializeDate(string $date): DateTime
    {
        $dateTime = DateTime::createFromFormat(Constant::DateDeserializationFormat, $date);
        if ($dateTime === false) {
            throw new JsonException("Failed to create date from string: $date");
        }
        return $dateTime;
    }

    /**
     * Deserializes the given array based on the type annotation.
     *
     * @param mixed[]|array<string, mixed> $data The array to be deserialized.
     * @param mixed[]|array<string, mixed> $type The type definition from the annotation.
     * @return mixed[]|array<string, mixed> The deserialized array.
     */
    public static function deserializeArray(array $data, array $type): array
    {
        return Utils::isMapType($type)
            ? self::deserializeMap($data, $type)
            : self::deserializeList($data, $type);
    }

    /**
     * Deserializes a value based on the type definition.
     *
     * @param mixed $data The data to deserialize.
     * @param mixed $type The type definition.
     * @return mixed The deserialized value.
     * @throws JsonException
     */
    private static function deserializeValue(mixed $data, mixed $type): mixed
    {
        if ($type instanceof Union) {
            foreach ($type->types as $unionType) {
                try {
                    return self::deserializeSingleValue($data, $unionType);
                } catch (Exception $e) {
                    continue;
                }
            }
            throw new JsonException("Cannot deserialize value with any of the union types.");
        }
        if (is_array($type)) {
            return self::deserializeArray((array)$data, $type);
        }

        if (gettype($type) != "string") {
            throw new JsonException("Unexpected non-string type.");
        }
        return self::deserializeSingleValue($data, $type);
    }

    /**
     * Deserializes a single value based on its type.
     *
     * @param mixed $data The data to deserialize.
     * @param string $type The expected type.
     * @return mixed The deserialized value.
     * @throws JsonException
     */
    private static function deserializeSingleValue(mixed $data, string $type): mixed
    {
        if ($type === 'null' && $data === null) {
            return null;
        }

        if ($type === 'date' && is_string($data)) {
            return self::deserializeDate($data);
        }

        if ($type === 'datetime' && is_string($data)) {
            return self::deserializeDateTime($data);
        }

        if ($type === 'mixed') {
            return $data;
        }

        if (class_exists($type) && is_array($data)) {
            return $type::jsonDeserialize($data);
        }

        if (gettype($data) === $type) {
            return $data;
        }

        throw new JsonException("Unable to deserialize value of type '" . gettype($data) . "' as '$type'.");
    }

    /**
     * Deserializes a map (associative array) where key and value types are defined.
     *
     * @param array<string, mixed> $data The associative array to deserialize.
     * @param array<string, mixed> $type The type definition for the map.
     * @return array<string, mixed> The deserialized map.
     * @throws JsonException
     */
    private static function deserializeMap(array $data, array $type): array
    {
        $keyType = array_key_first($type);
        $valueType = $type[$keyType];
        $result = [];

        foreach ($data as $key => $item) {
            $key = Utils::castKey($key, (string)$keyType);
            $result[$key] = self::deserializeValue($item, $valueType);
        }

        return $result;
    }

    /**
     * Deserializes a list (indexed array) where only the value type is defined.
     *
     * @param mixed[] $data The list to deserialize.
     * @param mixed[] $type The type definition for the list.
     * @return mixed[] The deserialized list.
     * @throws JsonException
     */
    private static function deserializeList(array $data, array $type): array
    {
        $valueType = $type[0];
        return array_map(fn ($item) => self::deserializeValue($item, $valueType), $data);
    }
}