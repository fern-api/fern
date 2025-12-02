<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class VariableValue extends JsonSerializableType
{
    /**
     * @var (
     *    'integerValue'
     *   |'booleanValue'
     *   |'doubleValue'
     *   |'stringValue'
     *   |'charValue'
     *   |'mapValue'
     *   |'listValue'
     *   |'binaryTreeValue'
     *   |'singlyLinkedListValue'
     *   |'doublyLinkedListValue'
     *   |'nullValue'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    int
     *   |bool
     *   |float
     *   |string
     *   |MapValue
     *   |array<VariableValue>
     *   |BinaryTreeValue
     *   |SinglyLinkedListValue
     *   |DoublyLinkedListValue
     *   |null
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'integerValue'
     *   |'booleanValue'
     *   |'doubleValue'
     *   |'stringValue'
     *   |'charValue'
     *   |'mapValue'
     *   |'listValue'
     *   |'binaryTreeValue'
     *   |'singlyLinkedListValue'
     *   |'doublyLinkedListValue'
     *   |'nullValue'
     *   |'_unknown'
     * ),
     *   value: (
     *    int
     *   |bool
     *   |float
     *   |string
     *   |MapValue
     *   |array<VariableValue>
     *   |BinaryTreeValue
     *   |SinglyLinkedListValue
     *   |DoublyLinkedListValue
     *   |null
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
     * @param int $integerValue
     * @return VariableValue
     */
    public static function integerValue(int $integerValue): VariableValue {
        return new VariableValue([
            'type' => 'integerValue',
            'value' => $integerValue,
        ]);
    }

    /**
     * @param bool $booleanValue
     * @return VariableValue
     */
    public static function booleanValue(bool $booleanValue): VariableValue {
        return new VariableValue([
            'type' => 'booleanValue',
            'value' => $booleanValue,
        ]);
    }

    /**
     * @param float $doubleValue
     * @return VariableValue
     */
    public static function doubleValue(float $doubleValue): VariableValue {
        return new VariableValue([
            'type' => 'doubleValue',
            'value' => $doubleValue,
        ]);
    }

    /**
     * @param string $stringValue
     * @return VariableValue
     */
    public static function stringValue(string $stringValue): VariableValue {
        return new VariableValue([
            'type' => 'stringValue',
            'value' => $stringValue,
        ]);
    }

    /**
     * @param string $charValue
     * @return VariableValue
     */
    public static function charValue(string $charValue): VariableValue {
        return new VariableValue([
            'type' => 'charValue',
            'value' => $charValue,
        ]);
    }

    /**
     * @param MapValue $mapValue
     * @return VariableValue
     */
    public static function mapValue(MapValue $mapValue): VariableValue {
        return new VariableValue([
            'type' => 'mapValue',
            'value' => $mapValue,
        ]);
    }

    /**
     * @param array<VariableValue> $listValue
     * @return VariableValue
     */
    public static function listValue(array $listValue): VariableValue {
        return new VariableValue([
            'type' => 'listValue',
            'value' => $listValue,
        ]);
    }

    /**
     * @param BinaryTreeValue $binaryTreeValue
     * @return VariableValue
     */
    public static function binaryTreeValue(BinaryTreeValue $binaryTreeValue): VariableValue {
        return new VariableValue([
            'type' => 'binaryTreeValue',
            'value' => $binaryTreeValue,
        ]);
    }

    /**
     * @param SinglyLinkedListValue $singlyLinkedListValue
     * @return VariableValue
     */
    public static function singlyLinkedListValue(SinglyLinkedListValue $singlyLinkedListValue): VariableValue {
        return new VariableValue([
            'type' => 'singlyLinkedListValue',
            'value' => $singlyLinkedListValue,
        ]);
    }

    /**
     * @param DoublyLinkedListValue $doublyLinkedListValue
     * @return VariableValue
     */
    public static function doublyLinkedListValue(DoublyLinkedListValue $doublyLinkedListValue): VariableValue {
        return new VariableValue([
            'type' => 'doublyLinkedListValue',
            'value' => $doublyLinkedListValue,
        ]);
    }

    /**
     * @return VariableValue
     */
    public static function nullValue(): VariableValue {
        return new VariableValue([
            'type' => 'nullValue',
            'value' => null,
        ]);
    }

    /**
     * @return bool
     */
    public function isIntegerValue(): bool {
        return is_int($this->value)&& $this->type === 'integerValue';
    }

    /**
     * @return int
     */
    public function asIntegerValue(): int {
        if (!(is_int($this->value)&& $this->type === 'integerValue')){
            throw new Exception(
                "Expected integerValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBooleanValue(): bool {
        return is_bool($this->value)&& $this->type === 'booleanValue';
    }

    /**
     * @return bool
     */
    public function asBooleanValue(): bool {
        if (!(is_bool($this->value)&& $this->type === 'booleanValue')){
            throw new Exception(
                "Expected booleanValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDoubleValue(): bool {
        return is_float($this->value)&& $this->type === 'doubleValue';
    }

    /**
     * @return float
     */
    public function asDoubleValue(): float {
        if (!(is_float($this->value)&& $this->type === 'doubleValue')){
            throw new Exception(
                "Expected doubleValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isStringValue(): bool {
        return is_string($this->value)&& $this->type === 'stringValue';
    }

    /**
     * @return string
     */
    public function asStringValue(): string {
        if (!(is_string($this->value)&& $this->type === 'stringValue')){
            throw new Exception(
                "Expected stringValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCharValue(): bool {
        return is_string($this->value)&& $this->type === 'charValue';
    }

    /**
     * @return string
     */
    public function asCharValue(): string {
        if (!(is_string($this->value)&& $this->type === 'charValue')){
            throw new Exception(
                "Expected charValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isMapValue(): bool {
        return $this->value instanceof MapValue&& $this->type === 'mapValue';
    }

    /**
     * @return MapValue
     */
    public function asMapValue(): MapValue {
        if (!($this->value instanceof MapValue&& $this->type === 'mapValue')){
            throw new Exception(
                "Expected mapValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isListValue(): bool {
        return is_array($this->value)&& $this->type === 'listValue';
    }

    /**
     * @return array<VariableValue>
     */
    public function asListValue(): array {
        if (!(is_array($this->value)&& $this->type === 'listValue')){
            throw new Exception(
                "Expected listValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBinaryTreeValue(): bool {
        return $this->value instanceof BinaryTreeValue&& $this->type === 'binaryTreeValue';
    }

    /**
     * @return BinaryTreeValue
     */
    public function asBinaryTreeValue(): BinaryTreeValue {
        if (!($this->value instanceof BinaryTreeValue&& $this->type === 'binaryTreeValue')){
            throw new Exception(
                "Expected binaryTreeValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSinglyLinkedListValue(): bool {
        return $this->value instanceof SinglyLinkedListValue&& $this->type === 'singlyLinkedListValue';
    }

    /**
     * @return SinglyLinkedListValue
     */
    public function asSinglyLinkedListValue(): SinglyLinkedListValue {
        if (!($this->value instanceof SinglyLinkedListValue&& $this->type === 'singlyLinkedListValue')){
            throw new Exception(
                "Expected singlyLinkedListValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDoublyLinkedListValue(): bool {
        return $this->value instanceof DoublyLinkedListValue&& $this->type === 'doublyLinkedListValue';
    }

    /**
     * @return DoublyLinkedListValue
     */
    public function asDoublyLinkedListValue(): DoublyLinkedListValue {
        if (!($this->value instanceof DoublyLinkedListValue&& $this->type === 'doublyLinkedListValue')){
            throw new Exception(
                "Expected doublyLinkedListValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNullValue(): bool {
        return is_null($this->value)&& $this->type === 'nullValue';
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
            case 'integerValue':
                $value = $this->value;
                $result['integerValue'] = $value;
                break;
            case 'booleanValue':
                $value = $this->value;
                $result['booleanValue'] = $value;
                break;
            case 'doubleValue':
                $value = $this->value;
                $result['doubleValue'] = $value;
                break;
            case 'stringValue':
                $value = $this->value;
                $result['stringValue'] = $value;
                break;
            case 'charValue':
                $value = $this->value;
                $result['charValue'] = $value;
                break;
            case 'mapValue':
                $value = $this->asMapValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'listValue':
                $value = $this->value;
                $result['listValue'] = $value;
                break;
            case 'binaryTreeValue':
                $value = $this->asBinaryTreeValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'singlyLinkedListValue':
                $value = $this->asSinglyLinkedListValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'doublyLinkedListValue':
                $value = $this->asDoublyLinkedListValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'nullValue':
                $result['nullValue'] = [];
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
            case 'integerValue':
                if (!array_key_exists('integerValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'integerValue'",
                    );
                }
                
                $args['value'] = $data['integerValue'];
                break;
            case 'booleanValue':
                if (!array_key_exists('booleanValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'booleanValue'",
                    );
                }
                
                $args['value'] = $data['booleanValue'];
                break;
            case 'doubleValue':
                if (!array_key_exists('doubleValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'doubleValue'",
                    );
                }
                
                $args['value'] = $data['doubleValue'];
                break;
            case 'stringValue':
                if (!array_key_exists('stringValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'stringValue'",
                    );
                }
                
                $args['value'] = $data['stringValue'];
                break;
            case 'charValue':
                if (!array_key_exists('charValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'charValue'",
                    );
                }
                
                $args['value'] = $data['charValue'];
                break;
            case 'mapValue':
                $args['value'] = MapValue::jsonDeserialize($data);
                break;
            case 'listValue':
                if (!array_key_exists('listValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'listValue'",
                    );
                }
                
                $args['value'] = $data['listValue'];
                break;
            case 'binaryTreeValue':
                $args['value'] = BinaryTreeValue::jsonDeserialize($data);
                break;
            case 'singlyLinkedListValue':
                $args['value'] = SinglyLinkedListValue::jsonDeserialize($data);
                break;
            case 'doublyLinkedListValue':
                $args['value'] = DoublyLinkedListValue::jsonDeserialize($data);
                break;
            case 'nullValue':
                $args['value'] = null;
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
