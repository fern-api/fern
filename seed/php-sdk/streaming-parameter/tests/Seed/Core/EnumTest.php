<?php

namespace Seed\Tests\Core;

use JsonSerializable;
use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

enum Shape: string implements JsonSerializable
{
    case Square = "SQUARE";
    case Circle = "CIRCLE";
    case Triangle = "TRIANGLE";

    /**
     * @return string
     */
    public function jsonSerialize(): string
    {
        return $this->value;
    }
}

class ShapeType extends SerializableType
{
    /**
     * @var Shape $shape
     */
    #[JsonProperty('shape')]
    public Shape $shape;

    /**
     * @var Shape[] $shapes
     */
    #[ArrayType([Shape::class])]
    #[JsonProperty('shapes')]
    public array $shapes;

    /**
     * @param Shape $shape
     * @param Shape[] $shapes
     */
    public function __construct(
        Shape $shape,
        array $shapes,
    ) {
        $this->shape = $shape;
        $this->shapes = $shapes;
    }
}

class EnumTest extends TestCase
{
    public function testShapeEnumSerialization(): void
    {
        $object = new ShapeType(
            Shape::Circle,
            [Shape::Square, Shape::Circle, Shape::Triangle]
        );

        $expectedJson = json_encode([
            'shape' => 'CIRCLE',
            'shapes' => ['SQUARE', 'CIRCLE', 'TRIANGLE']
        ], JSON_THROW_ON_ERROR);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString(
            $expectedJson,
            $serializedJson,
            'Serialized JSON does not match expected JSON for shape and shapes properties.'
        );
    }
}
