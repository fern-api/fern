<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithSameNumberTypes extends JsonSerializableType
{
    /**
     * @var (
     *    'positiveInt'
     *   |'negativeInt'
     *   |'anyNumber'
     *   |'_unknown'
     * ) $type
     */
    private readonly string $type;

    /**
     * @var (
     *    UnionWithSameNumberTypesPositiveInt
     *   |UnionWithSameNumberTypesNegativeInt
     *   |UnionWithSameNumberTypesAnyNumber
     *   |mixed
     * ) $value
     */
    private readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'positiveInt'
     *   |'negativeInt'
     *   |'anyNumber'
     *   |'_unknown'
     * ),
     *   value: (
     *    UnionWithSameNumberTypesPositiveInt
     *   |UnionWithSameNumberTypesNegativeInt
     *   |UnionWithSameNumberTypesAnyNumber
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
     *    'positiveInt'
     *   |'negativeInt'
     *   |'anyNumber'
     *   |'_unknown'
     * )
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return (
     *    UnionWithSameNumberTypesPositiveInt
     *   |UnionWithSameNumberTypesNegativeInt
     *   |UnionWithSameNumberTypesAnyNumber
     *   |mixed
     * )
     */
    public function getValue(): mixed
    {
        return $this->value;
    }

    /**
     * @param UnionWithSameNumberTypesPositiveInt $positiveInt
     * @return UnionWithSameNumberTypes
     */
    public static function positiveInt(UnionWithSameNumberTypesPositiveInt $positiveInt): UnionWithSameNumberTypes
    {
        return new UnionWithSameNumberTypes([
            'type' => 'positiveInt',
            'value' => $positiveInt,
        ]);
    }

    /**
     * @param UnionWithSameNumberTypesNegativeInt $negativeInt
     * @return UnionWithSameNumberTypes
     */
    public static function negativeInt(UnionWithSameNumberTypesNegativeInt $negativeInt): UnionWithSameNumberTypes
    {
        return new UnionWithSameNumberTypes([
            'type' => 'negativeInt',
            'value' => $negativeInt,
        ]);
    }

    /**
     * @param UnionWithSameNumberTypesAnyNumber $anyNumber
     * @return UnionWithSameNumberTypes
     */
    public static function anyNumber(UnionWithSameNumberTypesAnyNumber $anyNumber): UnionWithSameNumberTypes
    {
        return new UnionWithSameNumberTypes([
            'type' => 'anyNumber',
            'value' => $anyNumber,
        ]);
    }

    /**
     * @return bool
     */
    public function isPositiveInt(): bool
    {
        return $this->value instanceof UnionWithSameNumberTypesPositiveInt && $this->type === 'positiveInt';
    }

    /**
     * @return UnionWithSameNumberTypesPositiveInt
     */
    public function asPositiveInt(): UnionWithSameNumberTypesPositiveInt
    {
        if (!($this->value instanceof UnionWithSameNumberTypesPositiveInt && $this->type === 'positiveInt')) {
            throw new Exception(
                "Expected positiveInt; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNegativeInt(): bool
    {
        return $this->value instanceof UnionWithSameNumberTypesNegativeInt && $this->type === 'negativeInt';
    }

    /**
     * @return UnionWithSameNumberTypesNegativeInt
     */
    public function asNegativeInt(): UnionWithSameNumberTypesNegativeInt
    {
        if (!($this->value instanceof UnionWithSameNumberTypesNegativeInt && $this->type === 'negativeInt')) {
            throw new Exception(
                "Expected negativeInt; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isAnyNumber(): bool
    {
        return $this->value instanceof UnionWithSameNumberTypesAnyNumber && $this->type === 'anyNumber';
    }

    /**
     * @return UnionWithSameNumberTypesAnyNumber
     */
    public function asAnyNumber(): UnionWithSameNumberTypesAnyNumber
    {
        if (!($this->value instanceof UnionWithSameNumberTypesAnyNumber && $this->type === 'anyNumber')) {
            throw new Exception(
                "Expected anyNumber; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'positiveInt':
                $value = $this->asPositiveInt()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'negativeInt':
                $value = $this->asNegativeInt()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'anyNumber':
                $value = $this->asAnyNumber()->jsonSerialize();
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
            case 'positiveInt':
                $args['value'] = UnionWithSameNumberTypesPositiveInt::jsonDeserialize($data);
                break;
            case 'negativeInt':
                $args['value'] = UnionWithSameNumberTypesNegativeInt::jsonDeserialize($data);
                break;
            case 'anyNumber':
                $args['value'] = UnionWithSameNumberTypesAnyNumber::jsonDeserialize($data);
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
