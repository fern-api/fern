<?php

namespace Seed\Core;

use DateTime;
use Exception;
use JsonException;

class JsonDecoder
{
    /**
     * @throws JsonException
     */
    public static function decodeString(string $json): string {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * @throws JsonException
     */
    public static function decodeBoolean(string $json): bool {
        $decoded = self::decode($json);
        if (!is_bool($decoded)) {
            throw new JsonException("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * @throws JsonException
     */
    public static function decodeDatetime(string $json): DateTime {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value for datetime: " . $json);
        }
        return JsonDeserializer::deserializeDateTime($decoded);
    }

    /**
     * @throws JsonException
     */
    public static function decodeDate(string $json): DateTime {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new JsonException("Unexpected non-string json value for datetime: " . $json);
        }
        return JsonDeserializer::deserializeDate($decoded);
    }

    /**
     * @throws JsonException
     */
    public static function decodeFloat(string $json): float {
        $decoded = self::decode($json);
        if (!is_float($decoded)) {
            throw new JsonException("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * @throws JsonException
     */
    public static function decodeInt(string $json): int {
        $decoded = self::decode($json);
        if (!is_int($decoded)) {
            throw new JsonException("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * @param mixed[]|array<string, mixed> $type The type definition.
     * @return mixed[]|array<string, mixed> The deserialized array.
     * @throws JsonException
     */
    public static function jsonToDeserializedArray(string $json, array $type): array {
        $decoded = self::decode($json);
        if (!is_array($decoded)) {
            throw new JsonException("Unexpected non-array json value: " . $json);
        }
        return JsonDeserializer::deserializeArray($decoded, $type);
    }

    /**
     * @throws JsonException
     */
    public static function decode(string $json): mixed {
        return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    }
}