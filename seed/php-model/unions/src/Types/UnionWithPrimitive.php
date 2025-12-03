<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithPrimitive extends JsonSerializableType
{
    /**
     * @var (
     *    'integer'
     *   |'string'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    int
     *   |string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'integer'
     *   |'string'
     *   |'_unknown'
     * ),
     *   value: (
     *    int
     *   |string
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param int $integer
     * @return UnionWithPrimitive
     */
    public static function integer(int $integer): UnionWithPrimitive {
        return new UnionWithPrimitive([
            'type' => 'integer',
            'value' => $integer,
        ]);
    }

    /**
     * @param string $string
     * @return UnionWithPrimitive
     */
    public static function string(string $string): UnionWithPrimitive {
        return new UnionWithPrimitive([
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @return bool
     */
    public function isInteger(): bool {
        return is_int($this->value)&& $this->type === 'integer';
    }

    /**
     * @return int
     */
    public function asInteger(): int {
        if (!(is_int($this->value)&& $this->type === 'integer')){
            throw new Exception(
                "Expected integer; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString(): bool {
        return is_string($this->value)&& $this->type === 'string';
    }

    /**
     * @return string
     */
    public function asString(): string {
        if (!(is_string($this->value)&& $this->type === 'string')){
            throw new Exception(
                "Expected string; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'integer':
                $value = $this->value;
                $result['integer'] = $value;
                break;
            case 'string':
                $value = $this->value;
                $result['string'] = $value;
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
            case 'integer':
                if (!array_key_exists('integer', $data)){
                    throw new Exception(
                        "JSON data is missing property 'integer'",
                    );
                }
                
                $args['value'] = $data['integer'];
                break;
            case 'string':
                if (!array_key_exists('string', $data)){
                    throw new Exception(
                        "JSON data is missing property 'string'",
                    );
                }
                
                $args['value'] = $data['string'];
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
