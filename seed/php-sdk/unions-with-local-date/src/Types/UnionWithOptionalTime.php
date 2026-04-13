<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithOptionalTime extends JsonSerializableType
{
    /**
     * @var (
     *    'date'
     *   |'datetime'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    UnionWithOptionalTimeDate
     *   |UnionWithOptionalTimeDatetime
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'date'
     *   |'datetime'
     *   |'_unknown'
     * ),
     *   value: (
     *    UnionWithOptionalTimeDate
     *   |UnionWithOptionalTimeDatetime
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
     * @param UnionWithOptionalTimeDate $date
     * @return UnionWithOptionalTime
     */
    public static function date(UnionWithOptionalTimeDate $date): UnionWithOptionalTime
    {
        return new UnionWithOptionalTime([
            'type' => 'date',
            'value' => $date,
        ]);
    }

    /**
     * @param UnionWithOptionalTimeDatetime $datetime
     * @return UnionWithOptionalTime
     */
    public static function datetime(UnionWithOptionalTimeDatetime $datetime): UnionWithOptionalTime
    {
        return new UnionWithOptionalTime([
            'type' => 'datetime',
            'value' => $datetime,
        ]);
    }

    /**
     * @return bool
     */
    public function isDate(): bool
    {
        return $this->value instanceof UnionWithOptionalTimeDate && $this->type === 'date';
    }

    /**
     * @return UnionWithOptionalTimeDate
     */
    public function asDate(): UnionWithOptionalTimeDate
    {
        if (!($this->value instanceof UnionWithOptionalTimeDate && $this->type === 'date')) {
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
        return $this->value instanceof UnionWithOptionalTimeDatetime && $this->type === 'datetime';
    }

    /**
     * @return UnionWithOptionalTimeDatetime
     */
    public function asDatetime(): UnionWithOptionalTimeDatetime
    {
        if (!($this->value instanceof UnionWithOptionalTimeDatetime && $this->type === 'datetime')) {
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
            case 'date':
                $args['value'] = UnionWithOptionalTimeDate::jsonDeserialize($data);
                break;
            case 'datetime':
                $args['value'] = UnionWithOptionalTimeDatetime::jsonDeserialize($data);
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
