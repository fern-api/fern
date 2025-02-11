<?php

namespace Seed\Union\Types;

use JsonException;
use Seed\Core\Json\JsonDecoder;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Union\Types\Circle;
use Seed\Union\Types\Square;

class Shape extends JsonSerializableType
{
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var 'circle'|'square'|'triangle'|'_unknown' $type
     */
    public string $type;

    /**
     * @var Circle|Square|mixed
     */
    public mixed $value;

    /**
     * @param array{
     *    id: string,
     *    type: 'circle'|'square'|'triangle'|'_unknown',
     *    value: Circle|Square|mixed,
     * } $options
     */
    public function __construct(
        private readonly array $options
    ) {
        $this->id = $this->options['id'];
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function circle(
        string $id,
        Circle $circle
    ): Shape {
        return new Shape([
            'id' => $id,
            'type' => 'circle',
            'value' => $circle
        ]);
    }

    public static function square(
        string $id,
        Square $square
    ): Shape {
        return new Shape([
            'id' => $id,
            'type' => 'square',
            'value' => $square
        ]);
    }

    public static function triangle(string $id): Shape
    {
        return new Shape([
            'id' => $id,
            'type' => 'triangle',
            'value' => null,
        ]);
    }

    public static function _unknown(
        string $id,
        mixed $_unknown
    ): Shape {
        return new Shape([
            'id' => $id,
            'type' => '_unknown',
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
        $result["id"] = $this->id;

        $result["type"] = $this->type;

        switch ($this->type) {
            case 'circle':
                $value = $this->value->jsonSerialize();
                $result = array_merge($value, $result);
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
                $result = array_merge($value, $result);
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
        if (!array_key_exists('id', $data)) {
            throw new \Exception("Json data is missing property 'id'");
        }

        $id = $data['id'];

        if (!is_string($id)) {
            throw new \Exception("Expected property 'id' in json data to be string, instead received " . get_debug_type($id));
        }

        if (!array_key_exists('type', $data)) {
            throw new \Exception("Attempted to deserialize into Shape without a type provided");
        }

        $args = [];
        $args['id'] = $id;
        $type = $data['type'];
        $args['type'] = $type;
        switch ($type) {
            case 'circle':
                $args['value'] = Circle::jsonDeserialize($data);
                // @phpstan-ignore-next-line
                return new static($args);
            case 'square':
                if (!array_key_exists($type, $data)) {
                    throw new \Exception("Attempted to deserialize into ShapeSingleProperty without a " . $type . " value provided");
                }

                $args['value'] = Square::jsonDeserialize($data['square']);
                // @phpstan-ignore-next-line
                return new static($args);
            case 'triangle':
                // @phpstan-ignore-next-line
                return new static($args);
            case '_unknown':
            default:
                $args['value'] = $data;
                // @phpstan-ignore-next-line
                return new static($args);
        }
    }
}
