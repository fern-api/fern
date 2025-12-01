<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;

class TerminatedResponse extends JsonSerializableType
{

    /**
     * @param array{
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        unset($values);
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
