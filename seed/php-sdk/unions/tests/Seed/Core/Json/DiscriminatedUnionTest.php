<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
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
}
