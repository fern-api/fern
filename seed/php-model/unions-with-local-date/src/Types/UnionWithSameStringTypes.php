<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithSameStringTypes extends JsonSerializableType
{
    /**
     * @var (
     *    'customFormat'
     *   |'regularString'
     *   |'patternString'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'customFormat'
     *   |'regularString'
     *   |'patternString'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
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
     * @param string $customFormat
     * @return UnionWithSameStringTypes
     */
    public static function customFormat(string $customFormat): UnionWithSameStringTypes
    {
        return new UnionWithSameStringTypes([
            'type' => 'customFormat',
            'value' => $customFormat,
        ]);
    }

    /**
     * @param string $regularString
     * @return UnionWithSameStringTypes
     */
    public static function regularString(string $regularString): UnionWithSameStringTypes
    {
        return new UnionWithSameStringTypes([
            'type' => 'regularString',
            'value' => $regularString,
        ]);
    }

    /**
     * @param string $patternString
     * @return UnionWithSameStringTypes
     */
    public static function patternString(string $patternString): UnionWithSameStringTypes
    {
        return new UnionWithSameStringTypes([
            'type' => 'patternString',
            'value' => $patternString,
        ]);
    }

    /**
     * @return bool
     */
    public function isCustomFormat(): bool
    {
        return is_string($this->value) && $this->type === 'customFormat';
    }

    /**
     * @return string
     */
    public function asCustomFormat(): string
    {
        if (!(is_string($this->value) && $this->type === 'customFormat')) {
            throw new Exception(
                "Expected customFormat; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRegularString(): bool
    {
        return is_string($this->value) && $this->type === 'regularString';
    }

    /**
     * @return string
     */
    public function asRegularString(): string
    {
        if (!(is_string($this->value) && $this->type === 'regularString')) {
            throw new Exception(
                "Expected regularString; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPatternString(): bool
    {
        return is_string($this->value) && $this->type === 'patternString';
    }

    /**
     * @return string
     */
    public function asPatternString(): string
    {
        if (!(is_string($this->value) && $this->type === 'patternString')) {
            throw new Exception(
                "Expected patternString; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'customFormat':
                $value = $this->value;
                $result['customFormat'] = $value;
                break;
            case 'regularString':
                $value = $this->value;
                $result['regularString'] = $value;
                break;
            case 'patternString':
                $value = $this->value;
                $result['patternString'] = $value;
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
            case 'customFormat':
                if (!array_key_exists('customFormat', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'customFormat'",
                    );
                }

                $args['value'] = $data['customFormat'];
                break;
            case 'regularString':
                if (!array_key_exists('regularString', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'regularString'",
                    );
                }

                $args['value'] = $data['regularString'];
                break;
            case 'patternString':
                if (!array_key_exists('patternString', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'patternString'",
                    );
                }

                $args['value'] = $data['patternString'];
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
