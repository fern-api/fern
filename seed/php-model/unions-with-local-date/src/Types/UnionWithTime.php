<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Exception;
use Seed\Core\Json\JsonSerializer;
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
     *    int
     *   |DateTime
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
     *    int
     *   |DateTime
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
     * @param int $value
     * @return UnionWithTime
     */
    public static function value(int $value): UnionWithTime
    {
        return new UnionWithTime([
            'type' => 'value',
            'value' => $value,
        ]);
    }

    /**
     * @param DateTime $date
     * @return UnionWithTime
     */
    public static function date(DateTime $date): UnionWithTime
    {
        return new UnionWithTime([
            'type' => 'date',
            'value' => $date,
        ]);
    }

    /**
     * @param DateTime $datetime
     * @return UnionWithTime
     */
    public static function datetime(DateTime $datetime): UnionWithTime
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
        return is_int($this->value) && $this->type === 'value';
    }

    /**
     * @return int
     */
    public function asValue(): int
    {
        if (!(is_int($this->value) && $this->type === 'value')) {
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
        return $this->value instanceof DateTime && $this->type === 'date';
    }

    /**
     * @return DateTime
     */
    public function asDate(): DateTime
    {
        if (!($this->value instanceof DateTime && $this->type === 'date')) {
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
        return $this->value instanceof DateTime && $this->type === 'datetime';
    }

    /**
     * @return DateTime
     */
    public function asDatetime(): DateTime
    {
        if (!($this->value instanceof DateTime && $this->type === 'datetime')) {
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
                $value = $this->value;
                $result['value'] = $value;
                break;
            case 'date':
                $value = JsonSerializer::serializeDate($this->asDate());
                $result['date'] = $value;
                break;
            case 'datetime':
                $value = JsonSerializer::serializeDateTime($this->asDatetime());
                $result['datetime'] = $value;
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
                if (!array_key_exists('value', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'value'",
                    );
                }

                $args['value'] = $data['value'];
                break;
            case 'date':
                if (!array_key_exists('date', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'date'",
                    );
                }

                $args['value'] = $data['date'];
                break;
            case 'datetime':
                if (!array_key_exists('datetime', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'datetime'",
                    );
                }

                $args['value'] = $data['datetime'];
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
