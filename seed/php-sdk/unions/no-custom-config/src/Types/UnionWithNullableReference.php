<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithNullableReference extends JsonSerializableType
{
    /**
     * @var (
     *    'foo'
     *   |'bar'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    UnionWithNullableReferenceFoo
     *   |UnionWithNullableReferenceBar
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'foo'
     *   |'bar'
     *   |'_unknown'
     * ),
     *   value: (
     *    UnionWithNullableReferenceFoo
     *   |UnionWithNullableReferenceBar
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
     * @param UnionWithNullableReferenceFoo $foo
     * @return UnionWithNullableReference
     */
    public static function foo(UnionWithNullableReferenceFoo $foo): UnionWithNullableReference
    {
        return new UnionWithNullableReference([
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param UnionWithNullableReferenceBar $bar
     * @return UnionWithNullableReference
     */
    public static function bar(UnionWithNullableReferenceBar $bar): UnionWithNullableReference
    {
        return new UnionWithNullableReference([
            'type' => 'bar',
            'value' => $bar,
        ]);
    }

    /**
     * @return bool
     */
    public function isFoo(): bool
    {
        return $this->value instanceof UnionWithNullableReferenceFoo && $this->type === 'foo';
    }

    /**
     * @return UnionWithNullableReferenceFoo
     */
    public function asFoo(): UnionWithNullableReferenceFoo
    {
        if (!($this->value instanceof UnionWithNullableReferenceFoo && $this->type === 'foo')) {
            throw new Exception(
                "Expected foo; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBar(): bool
    {
        return $this->value instanceof UnionWithNullableReferenceBar && $this->type === 'bar';
    }

    /**
     * @return UnionWithNullableReferenceBar
     */
    public function asBar(): UnionWithNullableReferenceBar
    {
        if (!($this->value instanceof UnionWithNullableReferenceBar && $this->type === 'bar')) {
            throw new Exception(
                "Expected bar; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'foo':
                $value = $this->asFoo()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'bar':
                $value = $this->asBar()->jsonSerialize();
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
            case 'foo':
                $args['value'] = UnionWithNullableReferenceFoo::jsonDeserialize($data);
                break;
            case 'bar':
                $args['value'] = UnionWithNullableReferenceBar::jsonDeserialize($data);
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
