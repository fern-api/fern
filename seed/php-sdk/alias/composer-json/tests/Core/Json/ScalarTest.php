<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class Scalar extends JsonSerializableType
{
    /**
     * @var int $integerProperty
     */
    #[JsonProperty('integer_property')]
    public int $integerProperty;

    /**
     * @var float $floatProperty
     */
    #[JsonProperty('float_property')]
    public float $floatProperty;
    /**
     * @var float $otherFloatProperty
     */
    #[JsonProperty('other_float_property')]
    public float $otherFloatProperty;

    /**
     * @var bool $booleanProperty
     */
    #[JsonProperty('boolean_property')]
    public bool $booleanProperty;

    /**
     * @var string $stringProperty
     */
    #[JsonProperty('string_property')]
    public string $stringProperty;

    /**
     * @var array<int|float> $intFloatArray
     */
    #[ArrayType([new Union('integer', 'float')])]
    #[JsonProperty('int_float_array')]
    public array $intFloatArray;

    /**
     * @var array<float> $floatArray
     */
    #[ArrayType(['float'])]
    #[JsonProperty('float_array')]
    public array $floatArray;

    /**
     * @var bool|null $nullableBooleanProperty
     */
    #[JsonProperty('nullable_boolean_property')]
    public ?bool $nullableBooleanProperty;

    /**
     * @param array{
     *   integerProperty: int,
     *   floatProperty: float,
     *   otherFloatProperty: float,
     *   booleanProperty: bool,
     *   stringProperty: string,
     *   intFloatArray: array<int|float>,
     *   floatArray: array<float>,
     *   nullableBooleanProperty?: bool|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->integerProperty = $values['integerProperty'];
        $this->floatProperty = $values['floatProperty'];
        $this->otherFloatProperty = $values['otherFloatProperty'];
        $this->booleanProperty = $values['booleanProperty'];
        $this->stringProperty = $values['stringProperty'];
        $this->intFloatArray = $values['intFloatArray'];
        $this->floatArray = $values['floatArray'];
        $this->nullableBooleanProperty = $values['nullableBooleanProperty'] ?? null;
    }
}

class ScalarTest extends TestCase
{
    public function testAllScalarTypesIncludingFloat(): void
    {
        $expectedJson = json_encode(
            [
                'integer_property' => 42,
                'float_property' => 3.14159,
                'other_float_property' => 3,
                'boolean_property' => true,
                'string_property' => 'Hello, World!',
                'int_float_array' => [1, 2.5, 3, 4.75],
                'float_array' => [1, 2, 3, 4] // Ensure we handle "integer-looking" floats
            ],
            JSON_THROW_ON_ERROR
        );

        $object = Scalar::fromJson($expectedJson);
        $this->assertEquals(42, $object->integerProperty, 'integer_property should be 42.');
        $this->assertEquals(3.14159, $object->floatProperty, 'float_property should be 3.14159.');
        $this->assertTrue($object->booleanProperty, 'boolean_property should be true.');
        $this->assertEquals('Hello, World!', $object->stringProperty, 'string_property should be "Hello, World!".');
        $this->assertNull($object->nullableBooleanProperty, 'nullable_boolean_property should be null.');
        $this->assertEquals([1, 2.5, 3, 4.75], $object->intFloatArray, 'int_float_array should match the original data.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match original JSON for ScalarTypesTest.');
    }
}
