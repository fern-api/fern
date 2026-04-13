<?php

namespace Seed;

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
     *    UnionWithSameStringTypesCustomFormat
     *   |UnionWithSameStringTypesRegularString
     *   |UnionWithSameStringTypesPatternString
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
     *    UnionWithSameStringTypesCustomFormat
     *   |UnionWithSameStringTypesRegularString
     *   |UnionWithSameStringTypesPatternString
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
     * @param UnionWithSameStringTypesCustomFormat $customFormat
     * @return UnionWithSameStringTypes
     */
    public static function customFormat(UnionWithSameStringTypesCustomFormat $customFormat): UnionWithSameStringTypes
    {
        return new UnionWithSameStringTypes([
            'type' => 'customFormat',
            'value' => $customFormat,
        ]);
    }

    /**
     * @param UnionWithSameStringTypesRegularString $regularString
     * @return UnionWithSameStringTypes
     */
    public static function regularString(UnionWithSameStringTypesRegularString $regularString): UnionWithSameStringTypes
    {
        return new UnionWithSameStringTypes([
            'type' => 'regularString',
            'value' => $regularString,
        ]);
    }

    /**
     * @param UnionWithSameStringTypesPatternString $patternString
     * @return UnionWithSameStringTypes
     */
    public static function patternString(UnionWithSameStringTypesPatternString $patternString): UnionWithSameStringTypes
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
        return $this->value instanceof UnionWithSameStringTypesCustomFormat && $this->type === 'customFormat';
    }

    /**
     * @return UnionWithSameStringTypesCustomFormat
     */
    public function asCustomFormat(): UnionWithSameStringTypesCustomFormat
    {
        if (!($this->value instanceof UnionWithSameStringTypesCustomFormat && $this->type === 'customFormat')) {
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
        return $this->value instanceof UnionWithSameStringTypesRegularString && $this->type === 'regularString';
    }

    /**
     * @return UnionWithSameStringTypesRegularString
     */
    public function asRegularString(): UnionWithSameStringTypesRegularString
    {
        if (!($this->value instanceof UnionWithSameStringTypesRegularString && $this->type === 'regularString')) {
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
        return $this->value instanceof UnionWithSameStringTypesPatternString && $this->type === 'patternString';
    }

    /**
     * @return UnionWithSameStringTypesPatternString
     */
    public function asPatternString(): UnionWithSameStringTypesPatternString
    {
        if (!($this->value instanceof UnionWithSameStringTypesPatternString && $this->type === 'patternString')) {
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
                $value = $this->asCustomFormat()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'regularString':
                $value = $this->asRegularString()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'patternString':
                $value = $this->asPatternString()->jsonSerialize();
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
            case 'customFormat':
                $args['value'] = UnionWithSameStringTypesCustomFormat::jsonDeserialize($data);
                break;
            case 'regularString':
                $args['value'] = UnionWithSameStringTypesRegularString::jsonDeserialize($data);
                break;
            case 'patternString':
                $args['value'] = UnionWithSameStringTypesPatternString::jsonDeserialize($data);
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
