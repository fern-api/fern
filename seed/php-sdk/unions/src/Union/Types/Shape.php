<?php

namespace Seed\Union\Types;

use JsonException;
use Seed\Core\Json\JsonDecoder;
use Seed\Core\Json\JsonSerializableType;
use Seed\Union\Types\Circle;
use Seed\Union\Types\Square;

class Shape extends JsonSerializableType
{
    /**
     * @var 'circle'|'square'|'triangle'|'_unknown' $type
     */
    public string $type;

    /**
     * @var Circle|Square|mixed
     */
    public mixed $value;

    /**
     * @param ?array{
     *    type?: 'circle'|'square'|'triangle'|'_unknown',
     *    value?: Circle|Square|mixed,
     * } $options
     */
    public function __construct(
        private readonly ?array $options = null
    ) {
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function circle(
        Circle $circle
    ): Shape {
        return new Shape([
            'type' => 'circle',
            'value' => $circle
        ]);
    }

    public static function square(
        Square $square
    ): Shape {
        return new Shape([
            'type' => 'square',
            'value' => $square
        ]);
    }

    public static function triangle(): Shape
    {
        return new Shape([
            'type' => 'triangle',
        ]);
    }

    public static function _unknown(
        mixed $_unknown
    ): Shape {
        return new Shape([
            'value' => $_unknown
        ]);
    }

    public function asCircle(): Circle
    {
        if ($this->type != 'circle') {
            throw new \Exception(
                "Expected type to be 'circle'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof Circle)) {
            throw new \Exception(
                "Expected value to be instance of Circle."
            );
        }

        return $this->value;
    }

    public function asSquare(): Square
    {
        if ($this->type != 'square') {
            throw new \Exception(
                "Expected type to be 'square'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof Square)) {
            throw new \Exception(
                "Expected value to be instance of Square."
            );
        }

        return $this->value;
    }

    public function jsonSerialize(): array
    {
        $result = [];
        $result["type"] = $this->type;

        switch ($this->type) {
            case 'circle':
                $value = $this->value->jsonSerialize();
                foreach ($value as $k => $v) {
                    $result[$k] = $v;
                }
                break;
            case 'square':
                $value = $this->value->jsonSerialize();
                $result['square'] = $value;
                break;
            case 'triangle':
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                $value = $this->value->jsonSerialize();
                foreach ($value as $k => $v) {
                    $result[$k] = $v;
                }
        }

        return $result;
    }

    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new JsonException("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    public static function jsonDeserialize(array $data): static
    {
        if (!array_key_exists('type', $data)) {
            throw new \Exception("Attempted to deserialize into Shape without a type provided");
        }

        $type = $data['type'];
        switch ($type) {
            case 'circle':
                return Shape::circle(Circle::jsonDeserialize($data));
            case 'square':
                if (!array_key_exists($type, $data)) {
                    throw new \Exception("Attempted to deserialize into ShapeSingleProperty without a " . $type . " value provided");
                }

                $value = $data[$type];
                return Shape::square(Square::jsonDeserialize($value));
            case 'triangle':
                return Shape::triangle();
            case '_unknown':
            default:
                return Shape::_unknown($data);
        }
    }
}
