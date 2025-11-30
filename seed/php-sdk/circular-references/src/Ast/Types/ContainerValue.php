<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ContainerValue extends JsonSerializableType
{
    /**
     * @var (
     *    'list'
     *   |'optional'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    array<FieldValue>
     *   |FieldValue
     *   |mixed
     *   |null
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'list'
     *   |'optional'
     *   |'_unknown'
     * ),
     *   value: (
     *    array<FieldValue>
     *   |FieldValue
     *   |mixed
     *   |null
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
     * @param array<FieldValue> $list
     * @return ContainerValue
     */
    public static function list(array $list): ContainerValue {
        return new ContainerValue([
            'type' => 'list',
            'value' => $list,
        ]);
    }

    /**
     * @param ?FieldValue $optional
     * @return ContainerValue
     */
    public static function optional(?FieldValue $optional = null): ContainerValue {
        return new ContainerValue([
            'type' => 'optional',
            'value' => $optional,
        ]);
    }

    /**
     * @return bool
     */
    public function isList_(): bool {
        return is_array($this->value)&& $this->type === 'list';
    }

    /**
     * @return array<FieldValue>
     */
    public function asList_(): array {
        if (!(is_array($this->value)&& $this->type === 'list')){
            throw new Exception(
                "Expected list; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isOptional(): bool {
        return (is_null($this->value) || $this->value instanceof FieldValue)&& $this->type === 'optional';
    }

    /**
     * @return ?FieldValue
     */
    public function asOptional(): ?FieldValue {
        if (!((is_null($this->value) || $this->value instanceof FieldValue)&& $this->type === 'optional')){
            throw new Exception(
                "Expected optional; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'list':
                $value = $this->value;
                $result['list'] = $value;
                break;
            case 'optional':
                $value = $this->asOptional();
                if (!is_null($value)){
                    $value = $value->jsonSerialize();
                }
                $result['optional'] = $value;
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
            case 'list':
                if (!array_key_exists('list', $data)){
                    throw new Exception(
                        "JSON data is missing property 'list'",
                    );
                }
                
                $args['value'] = $data['list'];
                break;
            case 'optional':
                if (!array_key_exists('optional', $data)){
                    throw new Exception(
                        "JSON data is missing property 'optional'",
                    );
                }
                
                if (is_null($data['optional'])){
                    $args['value'] = null;
                } else{
                    if (!(is_array($data['optional']))){
                        throw new Exception(
                            "Expected property 'optional' in JSON data to be array, instead received " . get_debug_type($data['optional']),
                        );
                    }
                    $args['value'] = FieldValue::jsonDeserialize($data['optional']);
                }
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
