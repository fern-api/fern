<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithLiteral extends JsonSerializableType
{
    /**
     * @var string $base
     */
    #[JsonProperty('base')]
    public string $base;

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
     *   base: string,
     *   type: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->base = $values['base'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param string $base
     * @param string $fern
     * @return UnionWithLiteral
     */
    public static function fern(string $base, string $fern): UnionWithLiteral
    {
        return new UnionWithLiteral([
            'base' => $base,
            'type' => 'fern',
            'value' => $fern,
        ]);
    }

    /**
     * @param string $base
     * @param mixed $_unknown
     * @return UnionWithLiteral
     */
    public static function _unknown(string $base, mixed $_unknown): UnionWithLiteral
    {
        return new UnionWithLiteral([
            'base' => $base,
            'type' => '_unknown',
            'value' => $_unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isFern(): bool
    {
        return is_string($this->value) && $this->type === "fern";
    }

    /**
     * @return string
     */
    public function asFern(): string
    {
        if (!(is_string($this->value) && $this->type === "fern")) {
            throw new Exception(
                "Expected fern; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
            case "fern":
                $value = $this->value;
                $result['fern'] = $value;
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
        $args = [];
        if (!array_key_exists('base', $data)) {
            throw new Exception(
                "Json data is missing property 'base'",
            );
        }
        if (!(is_string($data['base']))) {
            throw new Exception(
                "Expected property 'base' in json data to be string, instead received " . get_debug_type($data['base']),
            );
        }
        $args['base'] = $data['base'];

        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "Json data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in json data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        switch ($type) {
            case "fern":
                $args['type'] = 'fern';
                if (!array_key_exists('fern', $data)) {
                    throw new Exception(
                        "Json data is missing property 'fern'",
                    );
                }

                $args['fern'] = $data['fern'];
                break;
            case "_unknown":
            default:
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
