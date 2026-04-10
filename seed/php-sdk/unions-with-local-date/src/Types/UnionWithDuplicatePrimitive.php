<?php

namespace Seed\Types;

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
    public readonly string $type;

    /**
     * @var (
     *    UnionWithDuplicatePrimitiveInteger1
     *   |UnionWithDuplicatePrimitiveInteger2
     *   |UnionWithDuplicatePrimitiveString1
     *   |UnionWithDuplicatePrimitiveString2
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

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
     *    UnionWithDuplicatePrimitiveInteger1
     *   |UnionWithDuplicatePrimitiveInteger2
     *   |UnionWithDuplicatePrimitiveString1
     *   |UnionWithDuplicatePrimitiveString2
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param UnionWithDuplicatePrimitiveInteger1 $integer1
     * @return UnionWithDuplicatePrimitive
     */
    public static function integer1(UnionWithDuplicatePrimitiveInteger1 $integer1): UnionWithDuplicatePrimitive
    {
        return new UnionWithDuplicatePrimitive([
            'type' => 'integer1',
            'value' => $integer1,
        ]);
    }

    /**
     * @param UnionWithDuplicatePrimitiveInteger2 $integer2
     * @return UnionWithDuplicatePrimitive
     */
    public static function integer2(UnionWithDuplicatePrimitiveInteger2 $integer2): UnionWithDuplicatePrimitive
    {
        return new UnionWithDuplicatePrimitive([
            'type' => 'integer2',
            'value' => $integer2,
        ]);
    }

    /**
     * @param UnionWithDuplicatePrimitiveString1 $string1
     * @return UnionWithDuplicatePrimitive
     */
    public static function string1(UnionWithDuplicatePrimitiveString1 $string1): UnionWithDuplicatePrimitive
    {
        return new UnionWithDuplicatePrimitive([
            'type' => 'string1',
            'value' => $string1,
        ]);
    }

    /**
     * @param UnionWithDuplicatePrimitiveString2 $string2
     * @return UnionWithDuplicatePrimitive
     */
    public static function string2(UnionWithDuplicatePrimitiveString2 $string2): UnionWithDuplicatePrimitive
    {
        return new UnionWithDuplicatePrimitive([
            'type' => 'string2',
            'value' => $string2,
        ]);
    }

    /**
     * @return bool
     */
    public function isInteger1(): bool
    {
        return $this->value instanceof UnionWithDuplicatePrimitiveInteger1 && $this->type === 'integer1';
    }

    /**
     * @return UnionWithDuplicatePrimitiveInteger1
     */
    public function asInteger1(): UnionWithDuplicatePrimitiveInteger1
    {
        if (!($this->value instanceof UnionWithDuplicatePrimitiveInteger1 && $this->type === 'integer1')) {
            throw new Exception(
                "Expected integer1; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInteger2(): bool
    {
        return $this->value instanceof UnionWithDuplicatePrimitiveInteger2 && $this->type === 'integer2';
    }

    /**
     * @return UnionWithDuplicatePrimitiveInteger2
     */
    public function asInteger2(): UnionWithDuplicatePrimitiveInteger2
    {
        if (!($this->value instanceof UnionWithDuplicatePrimitiveInteger2 && $this->type === 'integer2')) {
            throw new Exception(
                "Expected integer2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString1(): bool
    {
        return $this->value instanceof UnionWithDuplicatePrimitiveString1 && $this->type === 'string1';
    }

    /**
     * @return UnionWithDuplicatePrimitiveString1
     */
    public function asString1(): UnionWithDuplicatePrimitiveString1
    {
        if (!($this->value instanceof UnionWithDuplicatePrimitiveString1 && $this->type === 'string1')) {
            throw new Exception(
                "Expected string1; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString2(): bool
    {
        return $this->value instanceof UnionWithDuplicatePrimitiveString2 && $this->type === 'string2';
    }

    /**
     * @return UnionWithDuplicatePrimitiveString2
     */
    public function asString2(): UnionWithDuplicatePrimitiveString2
    {
        if (!($this->value instanceof UnionWithDuplicatePrimitiveString2 && $this->type === 'string2')) {
            throw new Exception(
                "Expected string2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'integer1':
                $value = $this->asInteger1()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'integer2':
                $value = $this->asInteger2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'string1':
                $value = $this->asString1()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'string2':
                $value = $this->asString2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'integer1':
                $args['value'] = UnionWithDuplicatePrimitiveInteger1::jsonDeserialize($data);
                break;
            case 'integer2':
                $args['value'] = UnionWithDuplicatePrimitiveInteger2::jsonDeserialize($data);
                break;
            case 'string1':
                $args['value'] = UnionWithDuplicatePrimitiveString1::jsonDeserialize($data);
                break;
            case 'string2':
                $args['value'] = UnionWithDuplicatePrimitiveString2::jsonDeserialize($data);
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
