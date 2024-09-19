<?php

namespace Seed\Core;

use DateTime;
use Exception;
use JsonException;

class Utils
{
    /**
     * Determines if the given type represents a map.
     *
     * @param mixed[]|array<string, mixed> $type The type definition from the annotation.
     * @return bool True if the type is a map, false if it's a list.
     */
    public static function isMapType(array $type): bool
    {
        return count($type) === 1 && !array_is_list($type);
    }

    /**
     * Casts the key to the appropriate type based on the key type.
     *
     * @param mixed $key The key to be cast.
     * @param string $keyType The type to cast the key to ('string', 'integer', 'float').
     * @return mixed The casted key.
     * @throws JsonException
     */
    public static function castKey(mixed $key, string $keyType): mixed
    {
        if (!is_scalar($key)) {
            throw new JsonException("Key must be a scalar type.");
        }
        return match ($keyType) {
            'integer' => (int)$key,
            'float' => (float)$key,
            'string' => (string)$key,
            default => $key,
        };
    }
}