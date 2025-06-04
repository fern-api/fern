<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Exception;
use Seed\Core\Json\JsonSerializer;
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
     *    DateTime
     *   |mixed
     *   |null
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
     *    DateTime
     *   |mixed
     *   |null
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
     * @param ?DateTime $date
     * @return UnionWithOptionalTime
     */
    public static function date(?DateTime $date = null): UnionWithOptionalTime
    {
        return new UnionWithOptionalTime([
            'type' => 'date',
            'value' => $date,
        ]);
    }

    /**
     * @param ?DateTime $datetime
     * @return UnionWithOptionalTime
     */
    public static function datetime(?DateTime $datetime = null): UnionWithOptionalTime
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
        return (is_null($this->value) || $this->value instanceof DateTime) && $this->type === 'date';
    }

    /**
     * @return ?DateTime
     */
    public function asDate(): ?DateTime
    {
        if (!((is_null($this->value) || $this->value instanceof DateTime) && $this->type === 'date')) {
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
        return (is_null($this->value) || $this->value instanceof DateTime) && $this->type === 'datetime';
    }

    /**
     * @return ?DateTime
     */
    public function asDatetime(): ?DateTime
    {
        if (!((is_null($this->value) || $this->value instanceof DateTime) && $this->type === 'datetime')) {
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
                $value = $this->asDate();
                if (!is_null($value)) {
                    $value = JsonSerializer::serializeDate($value);
                }
                $result['date'] = $value;
                break;
            case 'datetime':
                $value = $this->asDatetime();
                if (!is_null($value)) {
                    $value = JsonSerializer::serializeDateTime($value);
                }
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
