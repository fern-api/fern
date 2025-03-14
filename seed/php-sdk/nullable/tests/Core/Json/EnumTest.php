<?php

namespace Seed\Tests\Core\Json;

use JsonSerializable;
use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;

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

class ShapeType extends JsonSerializableType
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
     * @param array{
     *   shape: Shape,
     *   shapes: Shape[],
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        parent::__construct($values);

        $this->shape = $values['shape'];
        $this->shapes = $values['shapes'];
    }
}

class EnumTest extends TestCase
{
    public function testEnumSerialization(): void
    {
        $object = new ShapeType([
            'shape' => Shape::Circle,
            'shapes' => [Shape::Square, Shape::Circle, Shape::Triangle]
        ]);

        $expectedJson = json_encode([
            'shape' => 'CIRCLE',
            'shapes' => ['SQUARE', 'CIRCLE', 'TRIANGLE']
        ], JSON_THROW_ON_ERROR);

        $actualJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString(
            $expectedJson,
            $actualJson,
            'Serialized JSON does not match expected JSON for shape and shapes properties.'
        );
    }
}
