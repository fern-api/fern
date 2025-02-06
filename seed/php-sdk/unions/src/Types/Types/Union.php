<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;

/**
 * This is a simple union.
 */
class Union extends JsonSerializableType
{
    /**
     * @var string $type
     */
    public readonly string $type;

    /**
     * @param array{
     *   type: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
