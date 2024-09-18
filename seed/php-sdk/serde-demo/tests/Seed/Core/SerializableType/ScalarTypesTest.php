<?php

namespace Seed\Core\SerializableType;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class ScalarTypesTest extends SerializableType
{
    public function __construct(
        #[JsonProperty('integer_property')]
        public int    $integerProperty,

        #[JsonProperty('float_property')]
        public float  $floatProperty,

        #[JsonProperty('boolean_property')]
        public bool   $booleanProperty,

        #[JsonProperty('string_property')]
        public string $stringProperty,

        #[ArrayType([new Union('integer', 'float')])]
        #[JsonProperty('int_float_array')]
        public array  $intFloatArray,

        #[JsonProperty('nullable_boolean_property')]
        public ?bool  $nullableBooleanProperty = null
    )
    {
    }
}

class ScalarTypesTestTest extends TestCase
{
    public function testAllScalarTypesIncludingFloat(): void
    {
        // Create test data
        $data = [
            'integer_property' => 42,
            'float_property' => 3.14159,
            'boolean_property' => true,
            'string_property' => 'Hello, World!',
            'nullable_boolean_property' => null,
            'int_float_array' => [1, 2.5, 3, 4.75]
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = ScalarTypesTest::fromJson($json);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for ScalarTypesTest.');

        // Check scalar properties
        $this->assertEquals(42, $object->integerProperty, 'integer_property should be 42.');
        $this->assertEquals(3.14159, $object->floatProperty, 'float_property should be 3.14159.');
        $this->assertTrue($object->booleanProperty, 'boolean_property should be true.');
        $this->assertEquals('Hello, World!', $object->stringProperty, 'string_property should be "Hello, World!".');
        $this->assertNull($object->nullableBooleanProperty, 'nullable_boolean_property should be null.');

        // Check int_float_array
        $this->assertEquals([1, 2.5, 3, 4.75], $object->intFloatArray, 'int_float_array should match the original data.');
    }
}