<?php

namespace Seed\Ast;

use Seed\Core\Json\JsonSerializableType;

class ObjectValue extends JsonSerializableType
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
