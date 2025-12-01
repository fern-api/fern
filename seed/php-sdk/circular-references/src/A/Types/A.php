<?php

namespace Seed\A\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RootType;

class A extends JsonSerializableType
{
    use RootType;


    /**
     * @param array{
     *   s: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->s = $values['s'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
