<?php

namespace Seed\Core\SerializableType;

use PHPUnit\Framework\TestCase;
use Seed\Core\Constant;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;
use DateTime;

// Supporting Classes

class TestNestedType extends SerializableType
{
    public function __construct(
        #[JsonProperty('nested_property')]
        public string $nestedProperty
    )
    {
    }
}

class NestedUnionArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['integer' => ['integer' => new Union(TestNestedType::class, 'null', 'date')]])]
        #[JsonProperty('nested_array')]
        public array $nestedArray
    )
    {
    }
}

class NestedUnionArrayTypeTest extends TestCase
{
    public function testNestedUnionTypesInArrays()
    {
        $data = [
            'nested_array' => [
                1 => [
                    1 => ['nested_property' => 'Nested One'],
                    2 => null,
                    4 => '2023-01-02'
                ],
                2 => [
                    5 => ['nested_property' => 'Nested Two'],
                    7 => '2023-02-02'
                ]
            ]
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = NestedUnionArrayType::fromJson($json);

        // Level 1
        $this->assertInstanceOf(TestNestedType::class, $object->nestedArray[1][1], 'nested_array[1][1] should be an instance of TestNestedType.');
        $this->assertEquals('Nested One', $object->nestedArray[1][1]->nestedProperty, 'nested_array[1][1]->nestedProperty should match the original data.');

        $this->assertNull($object->nestedArray[1][2], 'nested_array[1][2] should be null.');

        // ensure dates are set with the default time
        $this->assertInstanceOf(DateTime::class, $object->nestedArray[1][4], 'nested_array[1][4] should be a DateTime instance.');
        $this->assertEquals('2023-01-02T00:00:00+00:00', $object->nestedArray[1][4]->format(Constant::DateTimeFormat), 'nested_array[1][4] should have the correct datetime.');

        // Level 2
        $this->assertInstanceOf(TestNestedType::class, $object->nestedArray[2][5], 'nested_array[2][5] should be an instance of TestNestedType.');
        $this->assertEquals('Nested Two', $object->nestedArray[2][5]->nestedProperty, 'nested_array[2][5]->nestedProperty should match the original data.');

        $this->assertInstanceOf(DateTime::class, $object->nestedArray[2][7], 'nested_array[1][4] should be a DateTime instance.');
        $this->assertEquals('2023-02-02', $object->nestedArray[2][7]->format('Y-m-d'), 'nested_array[1][4] should have the correct date.');

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for nested_array.');
    }
}