<?php

namespace Seed\Types;

use PHPUnit\Framework\TestCase;

class ExampleTypeTest extends TestCase
{
    public function testSerializationAndDeserialization()
    {
        // Define the original data for ExampleType with nested ExampleNestedType
        $originalData = [
            'name' => 'Test Example',
            'optional_name' => null,
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
                    10 => ['id' => 10, 'name' => 'NestedType 10'],
                    20 => ['id' => 20, 'name' => 'NestedType 20']
                ],
                2 => [
                    30 => ['id' => 30, 'name' => 'NestedType 30'],
                    40 => ['id' => 40, 'name' => 'NestedType 40']
                ]
            ]
        ];

        // Convert the original data into JSON
        $json = json_encode($originalData);

        // Deserialize the JSON into an ExampleType object using fromArray
        $deserializedObject = ExampleType::fromArray(json_decode($json, true));

        // Serialize the object back into JSON using toArray
        $serializedData = $deserializedObject->toArray();
        $serializedJson = json_encode($serializedData);

        // Assert that the serialized JSON matches the original JSON
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'The serialized JSON does not match the original JSON.');

        // Additional assertions can be added to check specific properties
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

        // Check a nested ExampleNestedType object
        $this->assertEquals(10, $deserializedObject->nestedTypeMap[1][10]->id);
        $this->assertEquals('NestedType 10', $deserializedObject->nestedTypeMap[1][10]->name);
        $this->assertEquals(20, $deserializedObject->nestedTypeMap[1][20]->id);
        $this->assertEquals('NestedType 20', $deserializedObject->nestedTypeMap[1][20]->name);
    }
}
