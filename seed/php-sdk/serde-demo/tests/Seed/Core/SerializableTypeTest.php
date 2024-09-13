<?php

namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use Seed\Core\ArrayType;
use DateTime;

// Define test classes at the file scope within the namespace

class TestNestedType extends SerializableType
{
    public function __construct(
        #[JsonProperty('nested_property')]
        public string $nestedProperty
    ) {}
}

/**
 * @param string[]                                    $stringArray
 * @param array<string, int>                          $mapProperty
 * @param array<int, TestNestedType|null>             $objectArray
 * @param array<int, array<int, string|null>>         $nestedArray
 * @param array<int, DateTime|null>                   $datesArray
 */
class TestType extends SerializableType
{
    public function __construct(
        #[JsonProperty('simple_property')]
        public string $simpleProperty,

        #[DateType(DateType::TYPE_DATE)]
        #[JsonProperty('date_property')]
        public DateTime $dateProperty,

        #[DateType(DateType::TYPE_DATETIME)]
        #[JsonProperty('datetime_property')]
        public DateTime $datetimeProperty,

        #[ArrayType(['string'])]
        #[JsonProperty('string_array')]
        public array $stringArray,

        #[ArrayType(['string' => 'int'])]
        #[JsonProperty('map_property')]
        public array $mapProperty,

        #[ArrayType(['int' => TestNestedType::class . '|null'])]
        #[JsonProperty('object_array')]
        public array $objectArray,

        #[ArrayType(['int' => ['int' => 'string|null']])]
        #[JsonProperty('nested_array')]
        public array $nestedArray,

        #[ArrayType(['date|null'])]
        #[JsonProperty('dates_array')]
        public array $datesArray,

        #[JsonProperty('nullable_property')]
        public ?string $nullableProperty = null // Move optional parameter to the end
    ) {}
}

/**
 * @param (string|null)[] $nullableStringArray
 */
class NullableArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['string|null'])]
        #[JsonProperty('nullable_string_array')]
        public array $nullableStringArray
    ) {}
}

/**
 * @param DateTime[] $dates
 */
class DateArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['date'])]
        #[JsonProperty('dates')]
        public array $dates
    ) {}
}

/**
 * @param array<int, string|int|null> $mixedArray
 */
class UnionArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['int' => 'string|int|null'])]
        #[JsonProperty('mixed_array')]
        public array $mixedArray
    ) {}
}

class NestedUnionArrayType extends SerializableType
{
    /**
     * @param array<int, array<int, TestNestedType|null|date|datetime>> $nestedArray
     */
    public function __construct(
        #[ArrayType(['int' => ['int' => TestNestedType::class . '|null|date|datetime']])]
        #[JsonProperty('nested_array')]
        public array $nestedArray
    ) {}
}

class NullPropertyType extends SerializableType
{
    public function __construct(
        #[JsonProperty('non_null_property')]
        public string $nonNullProperty,

        #[JsonProperty('null_property')]
        public ?string $nullProperty = null
    ) {}
}

/**
 * @param array<int, datetime|null|string> $mixedDates
 */
class MixedDateArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['int' => 'datetime|string|null'])]
        #[JsonProperty('mixed_dates')]
        public array $mixedDates
    ) {}
}

// Now, define the test class

class SerializableTypeTest extends TestCase
{
    public function testSerializationAndDeserialization()
    {
        // Create test data
        $data = [
            'simple_property' => 'Test String',
            // 'nullable_property' is omitted to test null serialization
            'date_property' => '2023-01-01',
            'datetime_property' => '2023-01-01T12:34:56+00:00',
            'string_array' => ['one', 'two', 'three'],
            'map_property' => ['key1' => 1, 'key2' => 2],
            'object_array' => [
                1 => ['nested_property' => 'Nested One'],
                2 => null, // Testing nullable objects in array
            ],
            'nested_array' => [
                1 => [1 => 'value1', 2 => null], // Testing nullable strings in nested array
                2 => [3 => 'value3', 4 => 'value4']
            ],
            'dates_array' => ['2023-01-01', null, '2023-03-01'] // Testing nullable dates in array
        ];

        // Convert data to JSON
        $json = json_encode($data);

        // Deserialize JSON to object
        $object = TestType::fromJson($json);

        // Serialize object back to JSON
        $serializedJson = $object->toJson();

        // Compare serialized JSON with original JSON
        $this->assertJsonStringEqualsJsonString($json, $serializedJson);

        // Check that nullable property is null and not included in JSON
        $this->assertNull($object->nullableProperty);
        $this->assertFalse(array_key_exists('nullable_property', json_decode($serializedJson, true)));

        // Check date properties
        $this->assertEquals('2023-01-01', $object->dateProperty->format('Y-m-d'));
        $this->assertEquals('2023-01-01 12:34:56', $object->datetimeProperty->format('Y-m-d H:i:s'));

        // Check arrays
        $this->assertEquals(['one', 'two', 'three'], $object->stringArray);
        $this->assertEquals(['key1' => 1, 'key2' => 2], $object->mapProperty);

        // Check object array with nullable elements
        $this->assertInstanceOf(TestNestedType::class, $object->objectArray[1]);
        $this->assertEquals('Nested One', $object->objectArray[1]->nestedProperty);
        $this->assertNull($object->objectArray[2]);

        // Check nested array with nullable strings
        $this->assertEquals('value1', $object->nestedArray[1][1]);
        $this->assertNull($object->nestedArray[1][2]);
        $this->assertEquals('value3', $object->nestedArray[2][3]);
        $this->assertEquals('value4', $object->nestedArray[2][4]);

        // Check dates array with nullable DateTime objects
        $this->assertInstanceOf(DateTime::class, $object->datesArray[0]);
        $this->assertEquals('2023-01-01', $object->datesArray[0]->format('Y-m-d'));
        $this->assertNull($object->datesArray[1]);
        $this->assertInstanceOf(DateTime::class, $object->datesArray[2]);
        $this->assertEquals('2023-03-01', $object->datesArray[2]->format('Y-m-d'));
    }

    public function testNullableTypesInArrays()
    {
        $data = [
            'nullable_string_array' => ['one', null, 'three']
        ];

        $json = json_encode($data);

        $object = NullableArrayType::fromJson($json);

        $this->assertEquals(['one', null, 'three'], $object->nullableStringArray);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson);
    }

    public function testDateTimeTypesInArrays()
    {
        $data = [
            'dates' => ['2023-01-01', '2023-02-01', '2023-03-01']
        ];

        $json = json_encode($data);

        $object = DateArrayType::fromJson($json);

        $this->assertInstanceOf(DateTime::class, $object->dates[0]);
        $this->assertEquals('2023-01-01', $object->dates[0]->format('Y-m-d'));
        $this->assertEquals('2023-02-01', $object->dates[1]->format('Y-m-d'));
        $this->assertEquals('2023-03-01', $object->dates[2]->format('Y-m-d'));

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson);
    }

    public function testUnionTypesInArrays()
    {
        $data = [
            'mixed_array' => [1 => 'one', 2 => 2, 3 => null]
        ];

        $json = json_encode($data);

        $object = UnionArrayType::fromJson($json);

        $this->assertEquals('one', $object->mixedArray[1]);
        $this->assertEquals(2, $object->mixedArray[2]);
        $this->assertNull($object->mixedArray[3]);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson);
    }

    public function testNestedUnionTypesInArrays()
    {
        $data = [
            'nested_array' => [
                1 => [
                    1 => ['value' => 'Nested One'],
                    2 => null,
                    3 => '2023-01-01T12:00:00+00:00', // datetime
                    4 => '2023-01-02' // date
                ],
                2 => [
                    5 => ['value' => 'Nested Two'],
                    6 => '2023-02-01T15:30:00+00:00', // datetime
                    7 => '2023-02-02' // date
                ]
            ]
        ];

        $json = json_encode($data);

        $object = NestedUnionArrayType::fromJson($json);

        // Level 1
        $this->assertInstanceOf(TestNestedType::class, $object->nestedArray[1][1]);
        $this->assertEquals('Nested One', $object->nestedArray[1][1]->value);

        $this->assertNull($object->nestedArray[1][2]);

        $this->assertInstanceOf(DateTime::class, $object->nestedArray[1][3]);
        $this->assertEquals('2023-01-01 12:00:00', $object->nestedArray[1][3]->format('Y-m-d H:i:s'));

        $this->assertInstanceOf(DateTime::class, $object->nestedArray[1][4]);
        $this->assertEquals('2023-01-02', $object->nestedArray[1][4]->format('Y-m-d'));

        // Level 2
        $this->assertInstanceOf(TestNestedType::class, $object->nestedArray[2][5]);
        $this->assertEquals('Nested Two', $object->nestedArray[2][5]->value);

        $this->assertInstanceOf(DateTime::class, $object->nestedArray[2][6]);
        $this->assertEquals('2023-02-01 15:30:00', $object->nestedArray[2][6]->format('Y-m-d H:i:s'));

        $this->assertInstanceOf(DateTime::class, $object->nestedArray[2][7]);
        $this->assertEquals('2023-02-02', $object->nestedArray[2][7]->format('Y-m-d'));

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson);
    }

    public function testNullPropertiesAreOmitted()
    {
        $object = new NullPropertyType('Test String');

        $json = $object->toJson();

        $data = json_decode($json, true);

        $this->assertArrayHasKey('non_null_property', $data);
        $this->assertArrayNotHasKey('null_property', $data);

        $this->assertEquals('Test String', $data['non_null_property']);
    }

    public function testDateTimeTypesInUnionArrays()
    {
        $data = [
            'mixed_dates' => [
                1 => '2023-01-01T12:00:00+00:00', // datetime
                2 => null,                         // null
                3 => 'Some String'                 // string
            ]
        ];

        $json = json_encode($data);

        $object = MixedDateArrayType::fromJson($json);

        $this->assertInstanceOf(DateTime::class, $object->mixedDates[1]);
        $this->assertEquals('2023-01-01 12:00:00', $object->mixedDates[1]->format('Y-m-d H:i:s'));

        $this->assertNull($object->mixedDates[2]);

        $this->assertEquals('Some String', $object->mixedDates[3]);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson);
    }
}