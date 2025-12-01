<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class VariableType extends JsonSerializableType
{
    /**
     * @var (
     *    'integerType'
     *   |'doubleType'
     *   |'booleanType'
     *   |'stringType'
     *   |'charType'
     *   |'listType'
     *   |'mapType'
     *   |'binaryTreeType'
     *   |'singlyLinkedListType'
     *   |'doublyLinkedListType'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    null
     *   |ListType
     *   |MapType
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'integerType'
     *   |'doubleType'
     *   |'booleanType'
     *   |'stringType'
     *   |'charType'
     *   |'listType'
     *   |'mapType'
     *   |'binaryTreeType'
     *   |'singlyLinkedListType'
     *   |'doublyLinkedListType'
     *   |'_unknown'
     * ),
     *   value: (
     *    null
     *   |ListType
     *   |MapType
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
     * @return VariableType
     */
    public static function integerType(): VariableType {
        return new VariableType([
            'type' => 'integerType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function doubleType(): VariableType {
        return new VariableType([
            'type' => 'doubleType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function booleanType(): VariableType {
        return new VariableType([
            'type' => 'booleanType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function stringType(): VariableType {
        return new VariableType([
            'type' => 'stringType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function charType(): VariableType {
        return new VariableType([
            'type' => 'charType',
            'value' => null,
        ]);
    }

    /**
     * @param ListType $listType
     * @return VariableType
     */
    public static function listType(ListType $listType): VariableType {
        return new VariableType([
            'type' => 'listType',
            'value' => $listType,
        ]);
    }

    /**
     * @param MapType $mapType
     * @return VariableType
     */
    public static function mapType(MapType $mapType): VariableType {
        return new VariableType([
            'type' => 'mapType',
            'value' => $mapType,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function binaryTreeType(): VariableType {
        return new VariableType([
            'type' => 'binaryTreeType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function singlyLinkedListType(): VariableType {
        return new VariableType([
            'type' => 'singlyLinkedListType',
            'value' => null,
        ]);
    }

    /**
     * @return VariableType
     */
    public static function doublyLinkedListType(): VariableType {
        return new VariableType([
            'type' => 'doublyLinkedListType',
            'value' => null,
        ]);
    }

    /**
     * @return bool
     */
    public function isIntegerType(): bool {
        return is_null($this->value)&& $this->type === 'integerType';
    }

    /**
     * @return bool
     */
    public function isDoubleType(): bool {
        return is_null($this->value)&& $this->type === 'doubleType';
    }

    /**
     * @return bool
     */
    public function isBooleanType(): bool {
        return is_null($this->value)&& $this->type === 'booleanType';
    }

    /**
     * @return bool
     */
    public function isStringType(): bool {
        return is_null($this->value)&& $this->type === 'stringType';
    }

    /**
     * @return bool
     */
    public function isCharType(): bool {
        return is_null($this->value)&& $this->type === 'charType';
    }

    /**
     * @return bool
     */
    public function isListType(): bool {
        return $this->value instanceof ListType&& $this->type === 'listType';
    }

    /**
     * @return ListType
     */
    public function asListType(): ListType {
        if (!($this->value instanceof ListType&& $this->type === 'listType')){
            throw new Exception(
                "Expected listType; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isMapType(): bool {
        return $this->value instanceof MapType&& $this->type === 'mapType';
    }

    /**
     * @return MapType
     */
    public function asMapType(): MapType {
        if (!($this->value instanceof MapType&& $this->type === 'mapType')){
            throw new Exception(
                "Expected mapType; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBinaryTreeType(): bool {
        return is_null($this->value)&& $this->type === 'binaryTreeType';
    }

    /**
     * @return bool
     */
    public function isSinglyLinkedListType(): bool {
        return is_null($this->value)&& $this->type === 'singlyLinkedListType';
    }

    /**
     * @return bool
     */
    public function isDoublyLinkedListType(): bool {
        return is_null($this->value)&& $this->type === 'doublyLinkedListType';
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
            case 'integerType':
                $result['integerType'] = [];
                break;
            case 'doubleType':
                $result['doubleType'] = [];
                break;
            case 'booleanType':
                $result['booleanType'] = [];
                break;
            case 'stringType':
                $result['stringType'] = [];
                break;
            case 'charType':
                $result['charType'] = [];
                break;
            case 'listType':
                $value = $this->asListType()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'mapType':
                $value = $this->asMapType()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'binaryTreeType':
                $result['binaryTreeType'] = [];
                break;
            case 'singlyLinkedListType':
                $result['singlyLinkedListType'] = [];
                break;
            case 'doublyLinkedListType':
                $result['doublyLinkedListType'] = [];
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
            case 'integerType':
                $args['value'] = null;
                break;
            case 'doubleType':
                $args['value'] = null;
                break;
            case 'booleanType':
                $args['value'] = null;
                break;
            case 'stringType':
                $args['value'] = null;
                break;
            case 'charType':
                $args['value'] = null;
                break;
            case 'listType':
                $args['value'] = ListType::jsonDeserialize($data);
                break;
            case 'mapType':
                $args['value'] = MapType::jsonDeserialize($data);
                break;
            case 'binaryTreeType':
                $args['value'] = null;
                break;
            case 'singlyLinkedListType':
                $args['value'] = null;
                break;
            case 'doublyLinkedListType':
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
