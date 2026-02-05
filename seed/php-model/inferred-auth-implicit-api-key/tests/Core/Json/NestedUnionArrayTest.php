<?php

namespace Seed\Tests\Core\Json;

use DateTime;
use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Constant;
use Seed\Core\Types\Union;

class UnionObject extends JsonSerializableType
{
    /**
     * @var string $nestedProperty
     */
    #[JsonProperty('nested_property')]
    public string $nestedProperty;

    /**
     * @param array{
     *   nestedProperty: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nestedProperty = $values['nestedProperty'];
    }
}

class NestedUnionArray extends JsonSerializableType
{
    /**
     * @var array<int, array<int, UnionObject|null|string>> $nestedArray
     */
    #[ArrayType(['integer' => ['integer' => new Union(UnionObject::class, 'null', 'date')]])]
    #[JsonProperty('nested_array')]
    public array $nestedArray;

    /**
     * @param array{
     *   nestedArray: array<int, array<int, UnionObject|null|string>>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nestedArray = $values['nestedArray'];
    }
}

class NestedUnionArrayTest extends TestCase
{
    public function testNestedUnionArray(): void
    {
        $expectedJson = json_encode(
            [
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
            ],
            JSON_THROW_ON_ERROR
        );

        $object = NestedUnionArray::fromJson($expectedJson);
        $this->assertInstanceOf(UnionObject::class, $object->nestedArray[1][1], 'nested_array[1][1] should be an instance of Object.');
        $this->assertEquals('Nested One', $object->nestedArray[1][1]->nestedProperty, 'nested_array[1][1]->nestedProperty should match the original data.');
        $this->assertNull($object->nestedArray[1][2], 'nested_array[1][2] should be null.');
        $this->assertInstanceOf(DateTime::class, $object->nestedArray[1][4], 'nested_array[1][4] should be a DateTime instance.');
        $this->assertEquals('2023-01-02T00:00:00+00:00', $object->nestedArray[1][4]->format(Constant::DateTimeFormat), 'nested_array[1][4] should have the correct datetime.');
        $this->assertInstanceOf(UnionObject::class, $object->nestedArray[2][5], 'nested_array[2][5] should be an instance of Object.');
        $this->assertEquals('Nested Two', $object->nestedArray[2][5]->nestedProperty, 'nested_array[2][5]->nestedProperty should match the original data.');
        $this->assertInstanceOf(DateTime::class, $object->nestedArray[2][7], 'nested_array[1][4] should be a DateTime instance.');
        $this->assertEquals('2023-02-02', $object->nestedArray[2][7]->format('Y-m-d'), 'nested_array[1][4] should have the correct date.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match original JSON for nested_array.');
    }
}
