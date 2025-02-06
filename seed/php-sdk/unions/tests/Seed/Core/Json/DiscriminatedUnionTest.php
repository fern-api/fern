<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Union\Types\Circle;
use Seed\Union\Types\Shape;
use Seed\Union\Types\Square;

class DiscriminatedUnionTest extends TestCase
{
    public function testRoundTripSerde_SamePropertiesAsObject(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'circle',
                'radius' => 1.0,
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

    public function testRoundTripSerde_SingleProperty(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'square',
                'square' => [
                    'length' => 1.0,
                ],
            ],
            JSON_THROW_ON_ERROR
        );

        $shape = Shape::fromJson($expected_json);

        $this->assertTrue($shape instanceof Shape, "Deserialized object must be of type Shape");
        $this->assertEquals($shape->type, 'square', "Type property must be square");
        $this->assertNotNull($shape->value, "Shape value must not be null");
        $this->assertTrue($shape->value instanceof Square);
        $this->assertEquals($shape->value->length, 1.0, "square radius must match definition");
        $this->assertJsonStringEqualsJsonString($shape->toJson(), $expected_json);
    }

    public function testRoundTripSerde_NoProperties(): void
    {
        $expected_json = json_encode(
            [
                'type' => 'triangle',
            ],
            JSON_THROW_ON_ERROR
        );

        $shape = Shape::fromJson($expected_json);

        $this->assertTrue($shape instanceof Shape, "Deserialized object must be of type Shape");
        $this->assertEquals($shape->type, 'triangle', "Type property must be triangle");
        $this->assertNull($shape->value, "Shape value must be null");
        $this->assertJsonStringEqualsJsonString($shape->toJson(), $expected_json);
    }
}
