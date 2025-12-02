<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithDuplicatePrimitive extends JsonSerializableType
{
    /**
     * @var (
     *    'integer1'
     *   |'integer2'
     *   |'string1'
     *   |'string2'
     *   |'_unknown'
     * ) $type
     */
    private readonly string $type;

    /**
     * @var (
     *    int
     *   |string
     *   |mixed
     * ) $value
     */
    private readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'integer1'
     *   |'integer2'
     *   |'string1'
     *   |'string2'
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
     * @return (
     *    'integer1'
     *   |'integer2'
     *   |'string1'
     *   |'string2'
     *   |'_unknown'
     * )
     */
    public function getType(): string {
        return $this->type;}

    /**
     * @return (
     *    int
     *   |string
     *   |mixed
     * )
     */
    public function getValue(): mixed {
        return $this->value;}

    /**
     * @param int $integer1
     * @return UnionWithDuplicatePrimitive
     */
    public static function integer1(int $integer1): UnionWithDuplicatePrimitive {
        return new UnionWithDuplicatePrimitive([
            'type' => 'integer1',
            'value' => $integer1,
        ]);
    }

    /**
     * @param int $integer2
     * @return UnionWithDuplicatePrimitive
     */
    public static function integer2(int $integer2): UnionWithDuplicatePrimitive {
        return new UnionWithDuplicatePrimitive([
            'type' => 'integer2',
            'value' => $integer2,
        ]);
    }

    /**
     * @param string $string1
     * @return UnionWithDuplicatePrimitive
     */
    public static function string1(string $string1): UnionWithDuplicatePrimitive {
        return new UnionWithDuplicatePrimitive([
            'type' => 'string1',
            'value' => $string1,
        ]);
    }

    /**
     * @param string $string2
     * @return UnionWithDuplicatePrimitive
     */
    public static function string2(string $string2): UnionWithDuplicatePrimitive {
        return new UnionWithDuplicatePrimitive([
            'type' => 'string2',
            'value' => $string2,
        ]);
    }

    /**
     * @return bool
     */
    public function isInteger1(): bool {
        return is_int($this->value)&& $this->type === 'integer1';
    }

    /**
     * @return int
     */
    public function asInteger1(): int {
        if (!(is_int($this->value)&& $this->type === 'integer1')){
            throw new Exception(
                "Expected integer1; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInteger2(): bool {
        return is_int($this->value)&& $this->type === 'integer2';
    }

    /**
     * @return int
     */
    public function asInteger2(): int {
        if (!(is_int($this->value)&& $this->type === 'integer2')){
            throw new Exception(
                "Expected integer2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString1(): bool {
        return is_string($this->value)&& $this->type === 'string1';
    }

    /**
     * @return string
     */
    public function asString1(): string {
        if (!(is_string($this->value)&& $this->type === 'string1')){
            throw new Exception(
                "Expected string1; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString2(): bool {
        return is_string($this->value)&& $this->type === 'string2';
    }

    /**
     * @return string
     */
    public function asString2(): string {
        if (!(is_string($this->value)&& $this->type === 'string2')){
            throw new Exception(
                "Expected string2; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'integer1':
                $value = $this->value;
                $result['integer1'] = $value;
                break;
            case 'integer2':
                $value = $this->value;
                $result['integer2'] = $value;
                break;
            case 'string1':
                $value = $this->value;
                $result['string1'] = $value;
                break;
            case 'string2':
                $value = $this->value;
                $result['string2'] = $value;
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
            case 'integer1':
                if (!array_key_exists('integer1', $data)){
                    throw new Exception(
                        "JSON data is missing property 'integer1'",
                    );
                }
                
                $args['value'] = $data['integer1'];
                break;
            case 'integer2':
                if (!array_key_exists('integer2', $data)){
                    throw new Exception(
                        "JSON data is missing property 'integer2'",
                    );
                }
                
                $args['value'] = $data['integer2'];
                break;
            case 'string1':
                if (!array_key_exists('string1', $data)){
                    throw new Exception(
                        "JSON data is missing property 'string1'",
                    );
                }
                
                $args['value'] = $data['string1'];
                break;
            case 'string2':
                if (!array_key_exists('string2', $data)){
                    throw new Exception(
                        "JSON data is missing property 'string2'",
                    );
                }
                
                $args['value'] = $data['string2'];
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
