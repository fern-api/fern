<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithDiscriminant extends JsonSerializableType
{
    /**
     * @var string $_type
     */
    public readonly string $_type;

    /**
     * @var (Foo|
     *    Bar|
     *    mixed) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   _type: string,
     *   value: (Foo|
     *    Bar|
     *    mixed),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->_type = $values['_type'];
        $this->value = $values['value'];
    }

    /**
     * @param Foo $foo
     * @return UnionWithDiscriminant
     */
    public static function foo(Foo $foo): UnionWithDiscriminant
    {
        return new UnionWithDiscriminant([
            '_type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param Bar $bar
     * @return UnionWithDiscriminant
     */
    public static function bar(Bar $bar): UnionWithDiscriminant
    {
        return new UnionWithDiscriminant([
            '_type' => 'bar',
            'value' => $bar,
        ]);
    }

    /**
     * @param mixed $_unknown
     * @return UnionWithDiscriminant
     */
    public static function _unknown(mixed $_unknown): UnionWithDiscriminant
    {
        return new UnionWithDiscriminant([
            '_type' => '_unknown',
            'value' => $_unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isFoo(): bool
    {
        return $this->value instanceof Foo && $this->_type === 'foo';
    }

    /**
     * @return Foo
     */
    public function asFoo(): Foo
    {
        if (!($this->value instanceof Foo && $this->_type === 'foo')) {
            throw new Exception(
                "Expected foo; got " . $this->_type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBar(): bool
    {
        return $this->value instanceof Bar && $this->_type === 'bar';
    }

    /**
     * @return Bar
     */
    public function asBar(): Bar
    {
        if (!($this->value instanceof Bar && $this->_type === 'bar')) {
            throw new Exception(
                "Expected bar; got " . $this->_type . "with value of type " . get_debug_type($this->value),
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
        $result['_type'] = $this->_type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->_type) {
            case 'foo':
                $value = $this->asFoo()->jsonSerialize();
                $result['foo'] = $value;
                break;
            case 'bar':
                $value = $this->asBar()->jsonSerialize();
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
        if (!array_key_exists('_type', $data)) {
            throw new Exception(
                "Json data is missing property '_type'",
            );
        }
        $type = $data['_type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in json data to be string, instead received " . get_debug_type($data['_type']),
            );
        }

        switch ($type) {
            case 'foo':
                $args['_type'] = 'foo';
                if (!array_key_exists('foo', $data)) {
                    throw new Exception(
                        "Json data is missing property 'foo'",
                    );
                }

                if (!(is_array($data['foo']))) {
                    throw new Exception(
                        "Expected property 'foo' in json data to be array, instead received " . get_debug_type($data['foo']),
                    );
                }
                $args['foo'] = Foo::jsonDeserialize($data['foo']);
                break;
            case 'bar':
                $args['_type'] = 'bar';
                if (!array_key_exists('bar', $data)) {
                    throw new Exception(
                        "Json data is missing property 'bar'",
                    );
                }

                if (!(is_array($data['bar']))) {
                    throw new Exception(
                        "Expected property 'bar' in json data to be array, instead received " . get_debug_type($data['bar']),
                    );
                }
                $args['bar'] = Bar::jsonDeserialize($data['bar']);
                break;
            case '_unknown':
            default:
                $args['_type'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
