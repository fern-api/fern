<?php

namespace Seed\A\Types;

use Seed\Core\Json\SerializableType;
use Seed\Traits\RootType;

class A extends SerializableType
{
    use RootType;


    /**
     * @param array{
     *   s: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->s = $values['s'];
    }
}
