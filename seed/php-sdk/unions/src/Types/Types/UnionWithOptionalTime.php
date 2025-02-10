<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Exception;
use Seed\Core\Json\JsonSerializer;

class UnionWithOptionalTime extends JsonSerializableType
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
     * @return bool
     */
    public function isDate(): bool
    {
        return (is_null($this->value) || $this->value instanceof DateTime) && $this->type === "date";
    }

    /**
     * @return ?DateTime
     */
    public function asDate(): ?DateTime
    {
        if (!((is_null($this->value) || $this->value instanceof DateTime) && $this->type === "date")) {
            throw new Exception(
                "Expected date; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDatetime(): bool
    {
        return (is_null($this->value) || $this->value instanceof DateTime) && $this->type === "datetime";
    }

    /**
     * @return ?DateTime
     */
    public function asDatetime(): ?DateTime
    {
        if (!((is_null($this->value) || $this->value instanceof DateTime) && $this->type === "datetime")) {
            throw new Exception(
                "Expected datetime; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
            case "date":
                $asDate = $this->asDate();
                if (is_null($asDate)) {
                    $value = $asDate;
                } else {
                    $value = JsonSerializer::serializeDate($asDate);
                }
                $result['date'] = $value;
                break;
            case "datetime":
                $asDatetime = $this->asDatetime();
                if (is_null($asDatetime)) {
                    $value = $asDatetime;
                } else {
                    $value = JsonSerializer::serializeDateTime($asDatetime);
                }
                $result['datetime'] = $value;
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
}
