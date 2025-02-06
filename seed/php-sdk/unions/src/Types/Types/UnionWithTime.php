<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;

class UnionWithTime extends JsonSerializableType
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
     * @return int
     */
    public function asValue(): int
    {
    }

    /**
     * @return DateTime
     */
    public function asDate(): DateTime
    {
    }

    /**
     * @return DateTime
     */
    public function asDatetime(): DateTime
    {
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
