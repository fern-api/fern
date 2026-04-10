<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithOptionalReference extends JsonSerializableType
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
     *    UnionWithOptionalReferenceFoo
     *   |UnionWithOptionalReferenceBar
     *   |mixed
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
     *    UnionWithOptionalReferenceFoo
     *   |UnionWithOptionalReferenceBar
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
     *    UnionWithOptionalReferenceFoo
     *   |UnionWithOptionalReferenceBar
     *   |mixed
     * )
     */
    public function getValue(): mixed
    {
        return $this->value;
    }

    /**
     * @param UnionWithOptionalReferenceFoo $foo
     * @return UnionWithOptionalReference
     */
    public static function foo(UnionWithOptionalReferenceFoo $foo): UnionWithOptionalReference
    {
        return new UnionWithOptionalReference([
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param UnionWithOptionalReferenceBar $bar
     * @return UnionWithOptionalReference
     */
    public static function bar(UnionWithOptionalReferenceBar $bar): UnionWithOptionalReference
    {
        return new UnionWithOptionalReference([
            'type' => 'bar',
            'value' => $bar,
        ]);
    }

    /**
     * @return bool
     */
    public function isFoo(): bool
    {
        return $this->value instanceof UnionWithOptionalReferenceFoo && $this->type === 'foo';
    }

    /**
     * @return UnionWithOptionalReferenceFoo
     */
    public function asFoo(): UnionWithOptionalReferenceFoo
    {
        if (!($this->value instanceof UnionWithOptionalReferenceFoo && $this->type === 'foo')) {
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
        return $this->value instanceof UnionWithOptionalReferenceBar && $this->type === 'bar';
    }

    /**
     * @return UnionWithOptionalReferenceBar
     */
    public function asBar(): UnionWithOptionalReferenceBar
    {
        if (!($this->value instanceof UnionWithOptionalReferenceBar && $this->type === 'bar')) {
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
                $args['value'] = UnionWithOptionalReferenceFoo::jsonDeserialize($data);
                break;
            case 'bar':
                $args['value'] = UnionWithOptionalReferenceBar::jsonDeserialize($data);
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
