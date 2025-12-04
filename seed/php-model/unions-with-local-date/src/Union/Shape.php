<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Shape extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var (
     *    'circle'
     *   |'square'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    Circle
     *   |Square
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   id: string,
     *   type: (
     *    'circle'
     *   |'square'
     *   |'_unknown'
     * ),
     *   value: (
     *    Circle
     *   |Square
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param string $id
     * @param Circle $circle
     * @return Shape
     */
    public static function circle(string $id, Circle $circle): Shape {
        return new Shape([
            'id' => $id,
            'type' => 'circle',
            'value' => $circle,
        ]);
    }

    /**
     * @param string $id
     * @param Square $square
     * @return Shape
     */
    public static function square(string $id, Square $square): Shape {
        return new Shape([
            'id' => $id,
            'type' => 'square',
            'value' => $square,
        ]);
    }

    /**
     * @return bool
     */
    public function isCircle(): bool {
        return $this->value instanceof Circle&& $this->type === 'circle';
    }

    /**
     * @return Circle
     */
    public function asCircle(): Circle {
        if (!($this->value instanceof Circle&& $this->type === 'circle')){
            throw new Exception(
                "Expected circle; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSquare(): bool {
        return $this->value instanceof Square&& $this->type === 'square';
    }

    /**
     * @return Square
     */
    public function asSquare(): Square {
        if (!($this->value instanceof Square&& $this->type === 'square')){
            throw new Exception(
                "Expected square; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'circle':
                $value = $this->asCircle()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'square':
                $value = $this->asSquare()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('id', $data)){
            throw new Exception(
                "JSON data is missing property 'id'",
            );
        }
        if (!(is_string($data['id']))){
            throw new Exception(
                "Expected property 'id' in JSON data to be string, instead received " . get_debug_type($data['id']),
            );
        }
        $args['id'] = $data['id'];
        
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'circle':
                $args['value'] = Circle::jsonDeserialize($data);
                break;
            case 'square':
                $args['value'] = Square::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
