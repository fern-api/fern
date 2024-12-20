<?php

namespace Seed\Tests\Core\Json;

use DateTime;
use PHPUnit\Framework\TestCase;
use Seed\Types\Types\UnionWithLiteral;
use Seed\Types\Types\UnionWithPrimitive;
use Seed\Types\Types\UnionWithTime;
use Seed\Union\Types\Circle;
use Seed\Union\Types\Shape;

class DiscriminatedUnionTest extends TestCase
{
    public function testRoundtripSerde(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'circle',
                'circle' => [
                    'radius' => 1.0
                ]
            ],
            JSON_THROW_ON_ERROR
        );

        $shape = Shape::fromJson($expected_json);

        $this->assertTrue($shape instanceof Shape, "Deserialized object must be of type Shape");
        $this->assertEquals($shape->type, 'circle', "Type property must be circle");
        $this->assertNotNull($shape->value, "Shape value must not be null");
        $this->assertTrue($shape->value instanceof Circle);
        $this->assertEquals($shape->value->radius, 1.0, "Circle radius must match definition");
        $this->assertJsonStringEqualsJsonString($shape->toJson(), $expected_json);
    }

    public function testRoundtripSerdeFlat(): void
    {
        $flat_json = json_encode(
            [
                'type' => 'circle',
                'radius' => 1.0
            ],
            JSON_THROW_ON_ERROR
        );

        $expected_json = json_encode(
            [
                'type' => 'circle',
                'circle' => [
                    'radius' => 1.0
                ]
            ],
            JSON_THROW_ON_ERROR
        );

        $shape = Shape::fromJson($flat_json);

        $this->assertTrue($shape instanceof Shape, "Deserialized object must be of type Shape");
        $this->assertEquals($shape->type, 'circle', "Type property must be circle");
        $this->assertNotNull($shape->value, "Shape value must not be null");
        $this->assertTrue($shape->value instanceof Circle);
        $this->assertEquals($shape->value->radius, 1.0, "Circle radius must match definition");
        $this->assertJsonStringEqualsJsonString($shape->toJson(), $expected_json);
    }

    public function testRoundTripSerdeWithTime(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'date',
                'date' => '2024-01-01'
            ],
            JSON_THROW_ON_ERROR
        );

        $dateUnion = UnionWithTime::fromJson($expected_json);

        $this->assertTrue($dateUnion instanceof UnionWithTime, "Deserialized object must be of type UnionWithTime");
        $this->assertEquals($dateUnion->type, 'date', "Type property must be date");
        $this->assertNotNull($dateUnion->value, "UnionWithTime value must not be null");
        $this->assertTrue($dateUnion->value instanceof DateTime);
        $this->assertEquals($dateUnion->value->format('Y-m-d'), '2024-01-01', "DateTime field must match definition");
        $this->assertJsonStringEqualsJsonString($dateUnion->toJson(), $expected_json);
    }

    public function testRoundTripSerdeWithPrimitive(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'integer',
                'integer' => 5
            ],
            JSON_THROW_ON_ERROR
        );

        $primitiveUnion = UnionWithPrimitive::fromJson($expected_json);

        $this->assertTrue($primitiveUnion instanceof UnionWithPrimitive, "Deserialized object must be of type UnionWithPrimitive");
        $this->assertEquals($primitiveUnion->type, 'integer', "Type property must be integer");
        $this->assertNotNull($primitiveUnion->value, "UnionWithPrimitive value must not be null");
        $this->assertTrue(is_integer($primitiveUnion->value));
        $this->assertEquals($primitiveUnion->value, 5, "primitive field must match definition");
        $this->assertJsonStringEqualsJsonString($primitiveUnion->toJson(), $expected_json);
    }

    public function testRoundTripSerdeWithLiteral(): void
    {
        $expected_json = json_encode(
            [
                'base' => 'base',
                'type' => 'fern',
                'fern' => 'fern',
            ],
            JSON_THROW_ON_ERROR
        );

        $literalUnion = UnionWithLiteral::fromJson($expected_json);

        $this->assertTrue($literalUnion instanceof UnionWithLiteral, "Deserialized object must be of type UnionWithLiteral");
        $this->assertEquals($literalUnion->type, 'fern', "Type property must be fern");
        $this->assertNotNull($literalUnion->value, "UnionWithLiteral value must not be null");
        $this->assertEquals($literalUnion->value, 'fern', "literal field must match definition");
        $this->assertEquals($literalUnion->base, 'base', "base field must match definition");
        $this->assertJsonStringEqualsJsonString($literalUnion->toJson(), $expected_json);
    }
}
