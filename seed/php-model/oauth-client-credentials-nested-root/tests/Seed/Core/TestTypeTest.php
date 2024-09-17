<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use Seed\Core\ArrayType;
use DateTime;
use Seed\Core\Union;

class TestNestedType1 extends SerializableType
{
    /**
     * @param string $simpleProperty
     * @param DateTime $dateProperty
     * @param DateTime $datetimeProperty
     * @param string[] $stringArray
     * @param array<string, integer> $mapProperty
     * @param array<integer, TestNestedType1|null> $objectArray
     * @param array<integer, array<integer, string|null>> $nestedArray
     * @param array<string|null> $datesArray
     * @param string|null $nullableProperty
     */
    public function __construct(
        #[JsonProperty('nested_property')]
        public string $nestedProperty
    ) {
    }
}

class TestType extends SerializableType
{
    public function __construct(
        #[JsonProperty('simple_property')]
        public string   $simpleProperty,
        #[DateType(DateType::TYPE_DATE)]
        #[JsonProperty('date_property')]
        public DateTime $dateProperty,
        #[DateType(DateType::TYPE_DATETIME)]
        #[JsonProperty('datetime_property')]
        public DateTime $datetimeProperty,

        // Array of strings
        #[ArrayType(['string'])]
        #[JsonProperty('string_array')]
        public array    $stringArray,

        // Map with string keys and int values
        #[ArrayType(['string' => 'integer'])]
        #[JsonProperty('map_property')]
        public array    $mapProperty,

        // Array of objects or null using Union
        #[ArrayType(['integer' => new Union(TestNestedType1::class, 'null')])]
        #[JsonProperty('object_array')]
        public array    $objectArray,

        // Nested array with union types (string|null)
        #[ArrayType(['integer' => ['integer' => new Union('string', 'null')]])]
        #[JsonProperty('nested_array')]
        public array    $nestedArray,

        // Array of dates or null using Union
        #[ArrayType([new Union('date', 'null')])]
        #[JsonProperty('dates_array')]
        public array    $datesArray,
        #[JsonProperty('nullable_property')]
        public ?string  $nullableProperty = null // Optional parameter at the end
    ) {
    }
}

class TestTypeTest extends TestCase
{
    /**
     * Test serialization and deserialization of all types in TestType
     */
    public function testSerializationAndDeserialization(): void
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

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = TestType::fromJson($json);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'The serialized JSON does not match the original JSON.');

        // Check that nullable property is null and not included in JSON
        $this->assertNull($object->nullableProperty, 'Nullable property should be null.');
        // @phpstan-ignore-next-line
        $this->assertFalse(array_key_exists('nullable_property', json_decode($serializedJson, true)), 'Nullable property should be omitted from JSON.');

        // Check date properties
        $this->assertInstanceOf(DateTime::class, $object->dateProperty, 'date_property should be a DateTime instance.');
        $this->assertEquals('2023-01-01', $object->dateProperty->format('Y-m-d'), 'date_property should have the correct date.');

        $this->assertInstanceOf(DateTime::class, $object->datetimeProperty, 'datetime_property should be a DateTime instance.');
        $this->assertEquals('2023-01-01 12:34:56', $object->datetimeProperty->format('Y-m-d H:i:s'), 'datetime_property should have the correct datetime.');

        // Check scalar arrays
        $this->assertEquals(['one', 'two', 'three'], $object->stringArray, 'string_array should match the original data.');
        $this->assertEquals(['key1' => 1, 'key2' => 2], $object->mapProperty, 'map_property should match the original data.');

        // Check object array with nullable elements
        $this->assertInstanceOf(TestNestedType1::class, $object->objectArray[1], 'object_array[1] should be an instance of TestNestedType1.');
        $this->assertEquals('Nested One', $object->objectArray[1]->nestedProperty, 'object_array[1]->nestedProperty should match the original data.');
        $this->assertNull($object->objectArray[2], 'object_array[2] should be null.');

        // Check nested array with nullable strings
        $this->assertEquals('value1', $object->nestedArray[1][1], 'nested_array[1][1] should match the original data.');
        $this->assertNull($object->nestedArray[1][2], 'nested_array[1][2] should be null.');
        $this->assertEquals('value3', $object->nestedArray[2][3], 'nested_array[2][3] should match the original data.');
        $this->assertEquals('value4', $object->nestedArray[2][4], 'nested_array[2][4] should match the original data.');

        // Check dates array with nullable DateTime objects
        $this->assertInstanceOf(DateTime::class, $object->datesArray[0], 'dates_array[0] should be a DateTime instance.');
        $this->assertEquals('2023-01-01', $object->datesArray[0]->format('Y-m-d'), 'dates_array[0] should have the correct date.');
        $this->assertNull($object->datesArray[1], 'dates_array[1] should be null.');
        $this->assertInstanceOf(DateTime::class, $object->datesArray[2], 'dates_array[2] should be a DateTime instance.');
        $this->assertEquals('2023-03-01', $object->datesArray[2]->format('Y-m-d'), 'dates_array[2] should have the correct date.');
    }
}
