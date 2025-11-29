<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithSameNumberTypes extends JsonSerializableType
{
    /**
     * @var (
     *    'positiveInt'
     *   |'negativeInt'
     *   |'anyNumber'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    int
     *   |float
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'positiveInt'
     *   |'negativeInt'
     *   |'anyNumber'
     *   |'_unknown'
     * ),
     *   value: (
     *    int
     *   |float
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
     * @param int $positiveInt
     * @return UnionWithSameNumberTypes
     */
    public static function positiveInt(int $positiveInt): UnionWithSameNumberTypes {
        return new UnionWithSameNumberTypes([
            'type' => 'positiveInt',
            'value' => $positiveInt,
        ]);
    }

    /**
     * @param int $negativeInt
     * @return UnionWithSameNumberTypes
     */
    public static function negativeInt(int $negativeInt): UnionWithSameNumberTypes {
        return new UnionWithSameNumberTypes([
            'type' => 'negativeInt',
            'value' => $negativeInt,
        ]);
    }

    /**
     * @param float $anyNumber
     * @return UnionWithSameNumberTypes
     */
    public static function anyNumber(float $anyNumber): UnionWithSameNumberTypes {
        return new UnionWithSameNumberTypes([
            'type' => 'anyNumber',
            'value' => $anyNumber,
        ]);
    }

    /**
     * @return bool
     */
    public function isPositiveInt(): bool {
        return is_int($this->value)&& $this->type === 'positiveInt';
    }

    /**
     * @return int
     */
    public function asPositiveInt(): int {
        if (!(is_int($this->value)&& $this->type === 'positiveInt')){
            throw new Exception(
                "Expected positiveInt; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNegativeInt(): bool {
        return is_int($this->value)&& $this->type === 'negativeInt';
    }

    /**
     * @return int
     */
    public function asNegativeInt(): int {
        if (!(is_int($this->value)&& $this->type === 'negativeInt')){
            throw new Exception(
                "Expected negativeInt; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isAnyNumber(): bool {
        return is_float($this->value)&& $this->type === 'anyNumber';
    }

    /**
     * @return float
     */
    public function asAnyNumber(): float {
        if (!(is_float($this->value)&& $this->type === 'anyNumber')){
            throw new Exception(
                "Expected anyNumber; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'positiveInt':
                $value = $this->value;
                $result['positiveInt'] = $value;
                break;
            case 'negativeInt':
                $value = $this->value;
                $result['negativeInt'] = $value;
                break;
            case 'anyNumber':
                $value = $this->value;
                $result['anyNumber'] = $value;
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
            case 'positiveInt':
                if (!array_key_exists('positiveInt', $data)){
                    throw new Exception(
                        "JSON data is missing property 'positiveInt'",
                    );
                }
                
                $args['value'] = $data['positiveInt'];
                break;
            case 'negativeInt':
                if (!array_key_exists('negativeInt', $data)){
                    throw new Exception(
                        "JSON data is missing property 'negativeInt'",
                    );
                }
                
                $args['value'] = $data['negativeInt'];
                break;
            case 'anyNumber':
                if (!array_key_exists('anyNumber', $data)){
                    throw new Exception(
                        "JSON data is missing property 'anyNumber'",
                    );
                }
                
                $args['value'] = $data['anyNumber'];
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
