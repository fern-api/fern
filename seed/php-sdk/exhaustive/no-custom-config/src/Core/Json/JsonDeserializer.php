<?php

namespace Seed\Core\Json;

use DateTime;
use Exception;
use JsonException;
use Seed\Core\Types\Constant;
use Seed\Core\Types\Union;

class JsonDeserializer
{
    /**
     * Deserializes a string into a DateTime object.
     *
     * @param string $datetime The date/time string to deserialize.
     * @return DateTime
     * @throws JsonException If the DateTime creation fails.
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
     * Deserializes a string into a DateTime object using a specific format.
     *
     * @param string $date The date string to deserialize.
     * @return DateTime
     * @throws JsonException If the date creation fails.
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
     * Deserializes an array based on type annotations (either a list or a map).
     *
     * @param mixed[]|array<string, mixed> $data The array to be deserialized.
     * @param mixed[]|array<string, mixed> $type The type definition from the annotation.
     * @return mixed[]|array<string, mixed> The deserialized array.
     * @throws JsonException If deserialization fails.
     */
    public static function deserializeArray(array $data, array $type): array
    {
        return Utils::isMapType($type)
            ? self::deserializeMap($data, $type)
            : self::deserializeList($data, $type);
    }

    /**
     * Deserializes a value based on its type definition.
     *
     * @param mixed $data The data to deserialize.
     * @param mixed $type The type definition.
     * @return mixed The deserialized value.
     * @throws JsonException If deserialization fails.
     */
    private static function deserializeValue(mixed $data, mixed $type): mixed
    {
        if ($type instanceof Union) {
            return self::deserializeUnion($data, $type);
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
     * Deserializes a value based on the possible types in a union type definition.
     *
     * @param mixed $data The data to deserialize.
     * @param Union $type The union type definition.
     * @return mixed The deserialized value.
     * @throws JsonException If none of the union types can successfully deserialize the value.
     */
    public static function deserializeUnion(mixed $data, Union $type): mixed
    {
        foreach ($type->types as $unionType) {
            try {
                return self::deserializeValue($data, $unionType);
            } catch (Exception) {
                continue;
            }
        }
        $readableType = Utils::getReadableType($data);
        throw new JsonException(
            "Cannot deserialize value of type $readableType with any of the union types: " . $type
        );
    }

    /**
     * Deserializes a single value based on its expected type.
     *
     * @param mixed $data The data to deserialize.
     * @param string $type The expected type.
     * @return mixed The deserialized value.
     * @throws JsonException If deserialization fails.
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
            return self::deserializeObject($data, $type);
        }

        // Handle floats as a special case since gettype($data) returns "double" for float values in PHP, and because
        // floats make come through from json_decoded as integers
        if ($type === 'float' && (is_numeric($data))) {
            return (float) $data;
        }

        if (gettype($data) === $type) {
            return $data;
        }

        throw new JsonException("Unable to deserialize value of type '" . gettype($data) . "' as '$type'.");
    }

    /**
     * Deserializes an array into an object of the given type.
     *
     * @param array<string, mixed> $data The data to deserialize.
     * @param string $type The class name of the object to deserialize into.
     *
     * @return object The deserialized object.
     *
     * @throws JsonException If the type does not implement JsonSerializableType.
     */
    public static function deserializeObject(array $data, string $type): object
    {
        if (!is_subclass_of($type, JsonSerializableType::class)) {
            throw new JsonException("$type is not a subclass of JsonSerializableType.");
        }
        return $type::jsonDeserialize($data);
    }

    /**
     * Deserializes a map (associative array) with defined key and value types.
     *
     * @param array<string, mixed> $data The associative array to deserialize.
     * @param array<string, mixed> $type The type definition for the map.
     * @return array<string, mixed> The deserialized map.
     * @throws JsonException If deserialization fails.
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
     * Deserializes a list (indexed array) with a defined value type.
     *
     * @param array<int, mixed> $data The list to deserialize.
     * @param array<int, mixed> $type The type definition for the list.
     * @return array<int, mixed> The deserialized list.
     * @throws JsonException If deserialization fails.
     */
    private static function deserializeList(array $data, array $type): array
    {
        $valueType = $type[0];
        return array_map(fn ($item) => self::deserializeValue($item, $valueType), $data);
    }
}
