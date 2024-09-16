<?php

namespace Seed\Core\SerializableType;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class EmptyArraysType extends SerializableType
{
    public function __construct(
        #[ArrayType(['string'])]
        #[JsonProperty('empty_string_array')]
        public array $emptyStringArray,

        #[ArrayType(['integer' => new Union('string', 'null')])]
        #[JsonProperty('empty_map_array')]
        public array $emptyMapArray,

        #[ArrayType([new Union('date', 'null')])]
        #[JsonProperty('empty_dates_array')]
        public array $emptyDatesArray
    )
    {
    }
}

class EmptyArraysTest extends TestCase
{
    public function testEmptyArrays(): void
    {
        $data = [
            'empty_string_array' => [],
            'empty_map_array' => [],
            'empty_dates_array' => []
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = EmptyArraysType::fromJson($json);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for EmptyArraysType.');

        // Check that arrays are empty
        $this->assertEmpty($object->emptyStringArray, 'empty_string_array should be empty.');
        $this->assertEmpty($object->emptyMapArray, 'empty_map_array should be empty.');
        $this->assertEmpty($object->emptyDatesArray, 'empty_dates_array should be empty.');
    }
}