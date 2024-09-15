<?php

namespace Seed\Core\SerializableType;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InvalidTypesTest extends SerializableType
{
    public function __construct(
        #[JsonProperty('integer_property')]
        public int $integerProperty
    )
    {
    }
}

class InvalidTypesTestTest extends TestCase
{
    public function testInvalidTypesThrowExceptions()
    {
        // Create test data with invalid type for integer_property (string instead of int)
        $data = [
            'integer_property' => 'not_an_integer'
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Unable to deserialize value of type 'string' as 'integer'.");

        // Attempt to deserialize invalid data
        $object = InvalidTypesTest::fromJson($json);
    }
}