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
        try {
            return new DateTime($decoded);
        } catch (\Exception $e) {
            throw new Exception("Unexpected date string: " . $e->getMessage());
        }
    }

    public static function decodeDate(string $json): DateTime {
        $decoded = self::decode($json);
        if (!is_string($decoded)) {
            throw new Exception("Unexpected non-string json value for datetime: " . $json);
        }
        try {
            return new DateTime($decoded);
        } catch (\Exception $e) {
            throw new Exception("Unexpected date string: " . $e->getMessage());
        }
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
     * @throws Exception
     */
    private static function decode(string $json): mixed {
        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Exception $e) {
            throw new Exception("Failed to decode json value: " . $json);
        }
    }
}