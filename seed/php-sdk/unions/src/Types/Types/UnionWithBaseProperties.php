<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithBaseProperties extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $type
     */
    public readonly string $type;

    /**
     * @var mixed $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   id: string,
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param string $id
     * @param int $integer
     * @return UnionWithBaseProperties
     */
    public static function integer(string $id, int $integer): UnionWithBaseProperties
    {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'integer',
            'value' => $integer,
        ]);
    }

    /**
     * @param string $id
     * @param string $string
     * @return UnionWithBaseProperties
     */
    public static function string(string $id, string $string): UnionWithBaseProperties
    {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @param string $id
     * @param Foo $foo
     * @return UnionWithBaseProperties
     */
    public static function foo(string $id, Foo $foo): UnionWithBaseProperties
    {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param string $id
     * @param mixed $_unknown
     * @return UnionWithBaseProperties
     */
    public static function _unknown(string $id, mixed $_unknown): UnionWithBaseProperties
    {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => '_unknown',
            'value' => $_unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isInteger(): bool
    {
        return is_int($this->value) && $this->type === "integer";
    }

    /**
     * @return int
     */
    public function asInteger(): int
    {
        if (!(is_int($this->value) && $this->type === "integer")) {
            throw new Exception(
                "Expected integer; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isString(): bool
    {
        return is_string($this->value) && $this->type === "string";
    }

    /**
     * @return string
     */
    public function asString(): string
    {
        if (!(is_string($this->value) && $this->type === "string")) {
            throw new Exception(
                "Expected string; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFoo(): bool
    {
        return $this->value instanceof Foo && $this->type === "foo";
    }

    /**
     * @return Foo
     */
    public function asFoo(): Foo
    {
        if (!($this->value instanceof Foo && $this->type === "foo")) {
            throw new Exception(
                "Expected foo; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
        $result["type"] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case "integer":
                $value = $this->value;
                $result['integer'] = $value;
                break;
            case "string":
                $value = $this->value;
                $result['string'] = $value;
                break;
            case "foo":
                $value = $this->asFoo()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case "_unknown":
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
        if (!array_key_exists('id', $data)) {
            throw new Exception(
                "Json data is missing property 'id'",
            );
        }
        $id = $data['id'];
        if (!(is_string($id))) {
            throw new Exception(
                "Expected property 'id' in json data to be string, instead received" . get_debug_type($id),
            );
        }

    }
}
