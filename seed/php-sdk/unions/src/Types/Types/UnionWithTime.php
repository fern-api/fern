<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;

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
     * @return mixed
     */
    public function asValue(): mixed
    {
    }

    /**
     * @return mixed
     */
    public function asDate(): mixed
    {
    }

    /**
     * @return mixed
     */
    public function asDatetime(): mixed
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
