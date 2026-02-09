<?php

namespace Seed\Types\Types;

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
    private readonly string $type;

    /**
     * @var (
     *    Foo
     *   |Bar
     *   |mixed
     *   |null
     * ) $value
     */
    private readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'foo'
     *   |'bar'
     *   |'_unknown'
     * ),
     *   value: (
     *    Foo
     *   |Bar
     *   |mixed
     *   |null
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
     * @return (
     *    'foo'
     *   |'bar'
     *   |'_unknown'
     * )
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return (
     *    Foo
     *   |Bar
     *   |mixed
     *   |null
     * )
     */
    public function getValue(): mixed
    {
        return $this->value;
    }

    /**
     * @param ?Foo $foo
     * @return UnionWithNullableReference
     */
    public static function foo(?Foo $foo = null): UnionWithNullableReference
    {
        return new UnionWithNullableReference([
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param ?Bar $bar
     * @return UnionWithNullableReference
     */
    public static function bar(?Bar $bar = null): UnionWithNullableReference
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
        return (is_null($this->value) || $this->value instanceof Foo) && $this->type === 'foo';
    }

    /**
     * @return ?Foo
     */
    public function asFoo(): ?Foo
    {
        if (!((is_null($this->value) || $this->value instanceof Foo) && $this->type === 'foo')) {
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
        return (is_null($this->value) || $this->value instanceof Bar) && $this->type === 'bar';
    }

    /**
     * @return ?Bar
     */
    public function asBar(): ?Bar
    {
        if (!((is_null($this->value) || $this->value instanceof Bar) && $this->type === 'bar')) {
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
                $value = $this->asFoo();
                if (!is_null($value)) {
                    $value = $value->jsonSerialize();
                }
                $result['foo'] = $value;
                break;
            case 'bar':
                $value = $this->asBar();
                if (!is_null($value)) {
                    $value = $value->jsonSerialize();
                }
                $result['bar'] = $value;
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
                if (!array_key_exists('foo', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'foo'",
                    );
                }

                if (is_null($data['foo'])) {
                    $args['value'] = null;
                } else {
                    if (!(is_array($data['foo']))) {
                        throw new Exception(
                            "Expected property 'foo' in JSON data to be array, instead received " . get_debug_type($data['foo']),
                        );
                    }
                    $args['value'] = Foo::jsonDeserialize($data['foo']);
                }
                break;
            case 'bar':
                if (!array_key_exists('bar', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'bar'",
                    );
                }

                if (is_null($data['bar'])) {
                    $args['value'] = null;
                } else {
                    if (!(is_array($data['bar']))) {
                        throw new Exception(
                            "Expected property 'bar' in JSON data to be array, instead received " . get_debug_type($data['bar']),
                        );
                    }
                    $args['value'] = Bar::jsonDeserialize($data['bar']);
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
