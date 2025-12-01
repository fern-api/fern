<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class DebugVariableValue extends JsonSerializableType
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
     *   |'binaryTreeNodeValue'
     *   |'singlyLinkedListNodeValue'
     *   |'doublyLinkedListNodeValue'
     *   |'undefinedValue'
     *   |'nullValue'
     *   |'genericValue'
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
     *   |DebugMapValue
     *   |array<DebugVariableValue>
     *   |BinaryTreeNodeAndTreeValue
     *   |SinglyLinkedListNodeAndListValue
     *   |DoublyLinkedListNodeAndListValue
     *   |null
     *   |GenericValue
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
     *   |'binaryTreeNodeValue'
     *   |'singlyLinkedListNodeValue'
     *   |'doublyLinkedListNodeValue'
     *   |'undefinedValue'
     *   |'nullValue'
     *   |'genericValue'
     *   |'_unknown'
     * ),
     *   value: (
     *    int
     *   |bool
     *   |float
     *   |string
     *   |DebugMapValue
     *   |array<DebugVariableValue>
     *   |BinaryTreeNodeAndTreeValue
     *   |SinglyLinkedListNodeAndListValue
     *   |DoublyLinkedListNodeAndListValue
     *   |null
     *   |GenericValue
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
     * @return DebugVariableValue
     */
    public static function integerValue(int $integerValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'integerValue',
            'value' => $integerValue,
        ]);
    }

    /**
     * @param bool $booleanValue
     * @return DebugVariableValue
     */
    public static function booleanValue(bool $booleanValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'booleanValue',
            'value' => $booleanValue,
        ]);
    }

    /**
     * @param float $doubleValue
     * @return DebugVariableValue
     */
    public static function doubleValue(float $doubleValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'doubleValue',
            'value' => $doubleValue,
        ]);
    }

    /**
     * @param string $stringValue
     * @return DebugVariableValue
     */
    public static function stringValue(string $stringValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'stringValue',
            'value' => $stringValue,
        ]);
    }

    /**
     * @param string $charValue
     * @return DebugVariableValue
     */
    public static function charValue(string $charValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'charValue',
            'value' => $charValue,
        ]);
    }

    /**
     * @param DebugMapValue $mapValue
     * @return DebugVariableValue
     */
    public static function mapValue(DebugMapValue $mapValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'mapValue',
            'value' => $mapValue,
        ]);
    }

    /**
     * @param array<DebugVariableValue> $listValue
     * @return DebugVariableValue
     */
    public static function listValue(array $listValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'listValue',
            'value' => $listValue,
        ]);
    }

    /**
     * @param BinaryTreeNodeAndTreeValue $binaryTreeNodeValue
     * @return DebugVariableValue
     */
    public static function binaryTreeNodeValue(BinaryTreeNodeAndTreeValue $binaryTreeNodeValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'binaryTreeNodeValue',
            'value' => $binaryTreeNodeValue,
        ]);
    }

    /**
     * @param SinglyLinkedListNodeAndListValue $singlyLinkedListNodeValue
     * @return DebugVariableValue
     */
    public static function singlyLinkedListNodeValue(SinglyLinkedListNodeAndListValue $singlyLinkedListNodeValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'singlyLinkedListNodeValue',
            'value' => $singlyLinkedListNodeValue,
        ]);
    }

    /**
     * @param DoublyLinkedListNodeAndListValue $doublyLinkedListNodeValue
     * @return DebugVariableValue
     */
    public static function doublyLinkedListNodeValue(DoublyLinkedListNodeAndListValue $doublyLinkedListNodeValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'doublyLinkedListNodeValue',
            'value' => $doublyLinkedListNodeValue,
        ]);
    }

    /**
     * @return DebugVariableValue
     */
    public static function undefinedValue(): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'undefinedValue',
            'value' => null,
        ]);
    }

    /**
     * @return DebugVariableValue
     */
    public static function nullValue(): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'nullValue',
            'value' => null,
        ]);
    }

    /**
     * @param GenericValue $genericValue
     * @return DebugVariableValue
     */
    public static function genericValue(GenericValue $genericValue): DebugVariableValue {
        return new DebugVariableValue([
            'type' => 'genericValue',
            'value' => $genericValue,
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
        return $this->value instanceof DebugMapValue&& $this->type === 'mapValue';
    }

    /**
     * @return DebugMapValue
     */
    public function asMapValue(): DebugMapValue {
        if (!($this->value instanceof DebugMapValue&& $this->type === 'mapValue')){
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
     * @return array<DebugVariableValue>
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
    public function isBinaryTreeNodeValue(): bool {
        return $this->value instanceof BinaryTreeNodeAndTreeValue&& $this->type === 'binaryTreeNodeValue';
    }

    /**
     * @return BinaryTreeNodeAndTreeValue
     */
    public function asBinaryTreeNodeValue(): BinaryTreeNodeAndTreeValue {
        if (!($this->value instanceof BinaryTreeNodeAndTreeValue&& $this->type === 'binaryTreeNodeValue')){
            throw new Exception(
                "Expected binaryTreeNodeValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSinglyLinkedListNodeValue(): bool {
        return $this->value instanceof SinglyLinkedListNodeAndListValue&& $this->type === 'singlyLinkedListNodeValue';
    }

    /**
     * @return SinglyLinkedListNodeAndListValue
     */
    public function asSinglyLinkedListNodeValue(): SinglyLinkedListNodeAndListValue {
        if (!($this->value instanceof SinglyLinkedListNodeAndListValue&& $this->type === 'singlyLinkedListNodeValue')){
            throw new Exception(
                "Expected singlyLinkedListNodeValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDoublyLinkedListNodeValue(): bool {
        return $this->value instanceof DoublyLinkedListNodeAndListValue&& $this->type === 'doublyLinkedListNodeValue';
    }

    /**
     * @return DoublyLinkedListNodeAndListValue
     */
    public function asDoublyLinkedListNodeValue(): DoublyLinkedListNodeAndListValue {
        if (!($this->value instanceof DoublyLinkedListNodeAndListValue&& $this->type === 'doublyLinkedListNodeValue')){
            throw new Exception(
                "Expected doublyLinkedListNodeValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isUndefinedValue(): bool {
        return is_null($this->value)&& $this->type === 'undefinedValue';
    }

    /**
     * @return bool
     */
    public function isNullValue(): bool {
        return is_null($this->value)&& $this->type === 'nullValue';
    }

    /**
     * @return bool
     */
    public function isGenericValue(): bool {
        return $this->value instanceof GenericValue&& $this->type === 'genericValue';
    }

    /**
     * @return GenericValue
     */
    public function asGenericValue(): GenericValue {
        if (!($this->value instanceof GenericValue&& $this->type === 'genericValue')){
            throw new Exception(
                "Expected genericValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'binaryTreeNodeValue':
                $value = $this->asBinaryTreeNodeValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'singlyLinkedListNodeValue':
                $value = $this->asSinglyLinkedListNodeValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'doublyLinkedListNodeValue':
                $value = $this->asDoublyLinkedListNodeValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'undefinedValue':
                $result['undefinedValue'] = [];
                break;
            case 'nullValue':
                $result['nullValue'] = [];
                break;
            case 'genericValue':
                $value = $this->asGenericValue()->jsonSerialize();
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
                $args['value'] = DebugMapValue::jsonDeserialize($data);
                break;
            case 'listValue':
                if (!array_key_exists('listValue', $data)){
                    throw new Exception(
                        "JSON data is missing property 'listValue'",
                    );
                }
                
                $args['value'] = $data['listValue'];
                break;
            case 'binaryTreeNodeValue':
                $args['value'] = BinaryTreeNodeAndTreeValue::jsonDeserialize($data);
                break;
            case 'singlyLinkedListNodeValue':
                $args['value'] = SinglyLinkedListNodeAndListValue::jsonDeserialize($data);
                break;
            case 'doublyLinkedListNodeValue':
                $args['value'] = DoublyLinkedListNodeAndListValue::jsonDeserialize($data);
                break;
            case 'undefinedValue':
                $args['value'] = null;
                break;
            case 'nullValue':
                $args['value'] = null;
                break;
            case 'genericValue':
                $args['value'] = GenericValue::jsonDeserialize($data);
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
