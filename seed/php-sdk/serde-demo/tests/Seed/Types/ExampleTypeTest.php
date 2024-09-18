<?php

namespace Seed\Tests\Types;

use PHPUnit\Framework\TestCase;

class ExampleTypeTest extends TestCase
{
    public function testSerializationAndDeserialization()
    {
        // Define the original data for ExampleType with nested ExampleNestedType
        $originalData = [
            'name' => 'Test Example',
            'age' => 30,
            'price' => 99.99,
            'is_active' => true,
            'start_date' => '2024-09-10',
            'created_at' => '2024-09-10T12:00:00+00:00',
            'string_list' => ['one', 'two', 'three'],
            'string_int_map' => ['key1' => 1, 'key2' => 2],
            'nested_string_list' => [['one', 'two'], ['three', 'four']],
            'nested_type_map' => [
                1 => [
                    10 => ['nested_field' => 'NestedType 10'],
                    20 => ['nested_field' => 'NestedType 20']
                ],
                2 => [
                    30 => ['nested_field' => 'NestedType 30'],
                    40 => ['nested_field' => 'NestedType 40']
                ]
            ],
            'weather_report' => 'clear'
        ];

        // Convert the original data into JSON
        $json = json_encode($originalData);

        // Deserialize the JSON into an ExampleType object using fromJson
        $deserializedObject = ExampleType::fromJson($json);

        // Serialize the object back into JSON using toJson
        $serializedJson = $deserializedObject->toJson();

        // Assert that the serialized JSON matches the original JSON
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'The serialized JSON does not match the original JSON.');

        // Additional assertions to check specific properties
        $this->assertEquals('Test Example', $deserializedObject->name);
        $this->assertNull($deserializedObject->optionalName);
        $this->assertEquals(30, $deserializedObject->age);
        $this->assertEquals(99.99, $deserializedObject->price);
        $this->assertTrue($deserializedObject->isActive);
        $this->assertEquals('2024-09-10', $deserializedObject->startDate->format('Y-m-d'));
        $this->assertEquals('2024-09-10 12:00:00', $deserializedObject->createdAt->format('Y-m-d H:i:s'));
        $this->assertEquals(['one', 'two', 'three'], $deserializedObject->stringList);
        $this->assertEquals(['key1' => 1, 'key2' => 2], $deserializedObject->stringIntMap);

        // Test nested structures
        $this->assertEquals([['one', 'two'], ['three', 'four']], $deserializedObject->nestedStringList);

        // Check nested ExampleNestedType objects
        $nestedTypeMap = $deserializedObject->nestedTypeMap;

        $this->assertInstanceOf(ExampleNestedType::class, $nestedTypeMap[1][10]);
        $this->assertEquals('NestedType 10', $nestedTypeMap[1][10]->nestedField);

        $this->assertInstanceOf(ExampleNestedType::class, $nestedTypeMap[1][20]);
        $this->assertEquals('NestedType 20', $nestedTypeMap[1][20]->nestedField);

        $this->assertInstanceOf(ExampleNestedType::class, $nestedTypeMap[2][30]);
        $this->assertEquals('NestedType 30', $nestedTypeMap[2][30]->nestedField);

        $this->assertInstanceOf(ExampleNestedType::class, $nestedTypeMap[2][40]);
        $this->assertEquals('NestedType 40', $nestedTypeMap[2][40]->nestedField);
    }
}