<?php

namespace Seed\Core\Json;

use JsonException;

class JsonEncoder
{
    /**
     * Encodes a PHP value into JSON string.
     *
     * @param mixed $value The PHP value to encode.
     * @return string The encoded string.
     * @throws JsonException
     */
    public static function encode(mixed $value): string
    {
        return json_encode($value, JSON_THROW_ON_ERROR);
    }
}
