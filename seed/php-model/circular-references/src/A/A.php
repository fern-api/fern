<?php

namespace Seed\A;

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
    ) {
        $this->s = $values['s'];
    }
}
