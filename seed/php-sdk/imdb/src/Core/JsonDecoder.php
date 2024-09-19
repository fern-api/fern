<?php

namespace Seed\Core;

use DateTime;
use Exception;

class JsonDecoder
{
    public static function decodeString(string $json): string {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new Exception("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    public static function decodeBoolean(string $json): bool {
        $decoded = self::decode($json);
        if (!is_bool($decoded)) {
            throw new Exception("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    public static function decodeDatetime(string $json): DateTime {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new Exception("Unexpected non-string json value for datetime: " . $json);
        }
        return JsonDeserializer::deserializeDateTime($decoded);
    }

    public static function decodeDate(string $json): DateTime {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new Exception("Unexpected non-string json value for datetime: " . $json);
        }
        return JsonDeserializer::deserializeDate($decoded);
    }

    public static function decodeFloat(string $json): float {
        $decoded = self::decode($json);
        if (!is_float($decoded)) {
            throw new Exception("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    public static function decodeInt(string $json): int {
        $decoded = self::decode($json);
        if (!is_int($decoded)) {
            throw new Exception("Unexpected non-string json value: " . $json);
        }
        return $decoded;
    }

    /**
     * @param mixed[]|array<string, mixed> $type The type definition.
     * @return mixed[]|array<string, mixed> The deserialized array.
     */
    public static function jsonToDeserializedArray(string $json, array $type): array {
        $decoded = self::decode($json);
        if (!is_array($decoded)) {
            throw new Exception("Unexpected non-array json value: " . $json);
        }
        return JsonDeserializer::deserializeArray($decoded, $type);
    }

    /**
     * @throws Exception
     */
    public static function decode(string $json): mixed {
        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Exception $e) {
            throw new Exception("Failed to decode json value: " . $json);
        }
    }
}