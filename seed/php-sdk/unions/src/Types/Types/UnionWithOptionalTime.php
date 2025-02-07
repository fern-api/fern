<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Exception;

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
     * @return ?DateTime
     */
    public function asDate(): ?DateTime
    {
        if (!(is_null($this->value) || $this->value instanceof DateTime)) {
            throw new Exception(
                "Unexpected value type",
            );
        }

        return $this->value;
    }

    /**
     * @return ?DateTime
     */
    public function asDatetime(): ?DateTime
    {
        if (!(is_null($this->value) || $this->value instanceof DateTime)) {
            throw new Exception(
                "Unexpected value type",
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
}
