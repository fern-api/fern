<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithTime extends JsonSerializableType
{
    /**
     * @var (
     *    'value'
     *   |'date'
     *   |'datetime'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    UnionWithTimeValue
     *   |UnionWithTimeDate
     *   |UnionWithTimeDatetime
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'value'
     *   |'date'
     *   |'datetime'
     *   |'_unknown'
     * ),
     *   value: (
     *    UnionWithTimeValue
     *   |UnionWithTimeDate
     *   |UnionWithTimeDatetime
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
     * @param UnionWithTimeValue $value
     * @return UnionWithTime
     */
    public static function value(UnionWithTimeValue $value): UnionWithTime
    {
        return new UnionWithTime([
            'type' => 'value',
            'value' => $value,
        ]);
    }

    /**
     * @param UnionWithTimeDate $date
     * @return UnionWithTime
     */
    public static function date(UnionWithTimeDate $date): UnionWithTime
    {
        return new UnionWithTime([
            'type' => 'date',
            'value' => $date,
        ]);
    }

    /**
     * @param UnionWithTimeDatetime $datetime
     * @return UnionWithTime
     */
    public static function datetime(UnionWithTimeDatetime $datetime): UnionWithTime
    {
        return new UnionWithTime([
            'type' => 'datetime',
            'value' => $datetime,
        ]);
    }

    /**
     * @return bool
     */
    public function isValue(): bool
    {
        return $this->value instanceof UnionWithTimeValue && $this->type === 'value';
    }

    /**
     * @return UnionWithTimeValue
     */
    public function asValue(): UnionWithTimeValue
    {
        if (!($this->value instanceof UnionWithTimeValue && $this->type === 'value')) {
            throw new Exception(
                "Expected value; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDate(): bool
    {
        return $this->value instanceof UnionWithTimeDate && $this->type === 'date';
    }

    /**
     * @return UnionWithTimeDate
     */
    public function asDate(): UnionWithTimeDate
    {
        if (!($this->value instanceof UnionWithTimeDate && $this->type === 'date')) {
            throw new Exception(
                "Expected date; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDatetime(): bool
    {
        return $this->value instanceof UnionWithTimeDatetime && $this->type === 'datetime';
    }

    /**
     * @return UnionWithTimeDatetime
     */
    public function asDatetime(): UnionWithTimeDatetime
    {
        if (!($this->value instanceof UnionWithTimeDatetime && $this->type === 'datetime')) {
            throw new Exception(
                "Expected datetime; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'value':
                $value = $this->asValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'date':
                $value = $this->asDate()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'datetime':
                $value = $this->asDatetime()->jsonSerialize();
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
            case 'value':
                $args['value'] = UnionWithTimeValue::jsonDeserialize($data);
                break;
            case 'date':
                $args['value'] = UnionWithTimeDate::jsonDeserialize($data);
                break;
            case 'datetime':
                $args['value'] = UnionWithTimeDatetime::jsonDeserialize($data);
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
