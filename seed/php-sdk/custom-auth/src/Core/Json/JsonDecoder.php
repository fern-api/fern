<?php

namespace Seed\Core\Json;

use DateTime;
use Exception;
use JsonException;
use Seed\Core\Types\Union;

class JsonDecoder
{
    /**
     * Decodes a JSON string and returns a string.
     *
     * @param string $json The JSON string to decode.
     * @return string The decoded string.
     * @throws JsonException If the decoded value is not a string.
     */
    public static function decodeString(string $json): string
    {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * Decodes a JSON string and returns a boolean.
     *
     * @param string $json The JSON string to decode.
     * @return bool The decoded boolean.
     * @throws JsonException If the decoded value is not a boolean.
     */
    public static function decodeBool(string $json): bool
    {
        $decoded = self::decode($json);
        if (!is_bool($decoded)) {
            throw new JsonException("Unexpected non-boolean json value: " . $json);
        }
        return $decoded;
    }

    /**
     * Decodes a JSON string and returns a DateTime object.
     *
     * @param string $json The JSON string to decode.
     * @return DateTime The decoded DateTime object.
     * @throws JsonException If the decoded value is not a valid datetime string.
     */
    public static function decodeDateTime(string $json): DateTime
    {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value for datetime: " . $json);
        }
        return JsonDeserializer::deserializeDateTime($decoded);
    }

    /**
     * Decodes a JSON string and returns a DateTime object representing a date.
     *
     * @param string $json The JSON string to decode.
     * @return DateTime The decoded DateTime object.
     * @throws JsonException If the decoded value is not a valid date string.
     */
    public static function decodeDate(string $json): DateTime
    {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value for date: " . $json);
        }
        return JsonDeserializer::deserializeDate($decoded);
    }

    /**
     * Decodes a JSON string and returns a float.
     *
     * @param string $json The JSON string to decode.
     * @return float The decoded float.
     * @throws JsonException If the decoded value is not a float.
     */
    public static function decodeFloat(string $json): float
    {
        $decoded = self::decode($json);
        if (!is_float($decoded)) {
            throw new JsonException("Unexpected non-float json value: " . $json);
        }
        return $decoded;
    }

    /**
     * Decodes a JSON string and returns an integer.
     *
     * @param string $json The JSON string to decode.
     * @return int The decoded integer.
     * @throws JsonException If the decoded value is not an integer.
     */
    public static function decodeInt(string $json): int
    {
        $decoded = self::decode($json);
        if (!is_int($decoded)) {
            throw new JsonException("Unexpected non-integer json value: " . $json);
        }
        return $decoded;
    }

    /**
     * Decodes a JSON string into an array and deserializes it based on the provided type.
     *
     * @param string $json The JSON string to decode.
     * @param mixed[]|array<string, mixed> $type The type definition for deserialization.
     * @return mixed[]|array<string, mixed> The deserialized array.
     * @throws JsonException If the decoded value is not an array.
     */
    public static function decodeArray(string $json, array $type): array
    {
        $decoded = self::decode($json);
        if (!is_array($decoded)) {
            throw new JsonException("Unexpected non-array json value: " . $json);
        }
        return JsonDeserializer::deserializeArray($decoded, $type);
    }

    /**
     * Decodes a JSON string and deserializes it based on the provided union type definition.
     *
     * @param string $json The JSON string to decode.
     * @param Union $union The union type definition for deserialization.
     * @return mixed The deserialized value.
     * @throws JsonException If the deserialization for all types in the union fails.
     */
    public static function decodeUnion(string $json, Union $union): mixed
    {
        $decoded = self::decode($json);
        return JsonDeserializer::deserializeUnion($decoded, $union);
    }
    /**
     * Decodes a JSON string and returns a mixed.
     *
     * @param string $json The JSON string to decode.
     * @return mixed The decoded mixed.
     * @throws JsonException If the decoded value is not an mixed.
     */
    public static function decodeMixed(string $json): mixed
    {
        return self::decode($json);
    }

    /**
     * Decodes a JSON string into a PHP value.
     *
     * @param string $json The JSON string to decode.
     * @return mixed The decoded value.
     * @throws JsonException If an error occurs during JSON decoding.
     */
    public static function decode(string $json): mixed
    {
        return json_decode($json, associative: true, flags: JSON_THROW_ON_ERROR);
    }
}
