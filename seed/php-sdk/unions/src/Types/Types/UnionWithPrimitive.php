<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithPrimitive extends JsonSerializableType
{
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
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param int $integer
     * @return UnionWithPrimitive
     */
    public static function integer(int $integer): UnionWithPrimitive
    {
        return new UnionWithPrimitive([
            'type' => 'integer',
            'value' => $integer,
        ]);
    }

    /**
     * @param string $string
     * @return UnionWithPrimitive
     */
    public static function string(string $string): UnionWithPrimitive
    {
        return new UnionWithPrimitive([
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @param mixed $_unknown
     * @return UnionWithPrimitive
     */
    public static function _unknown(mixed $_unknown): UnionWithPrimitive
    {
        return new UnionWithPrimitive([
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
    }
}
