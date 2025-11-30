<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Ast\Traits\Berry;

class Acai extends JsonSerializableType
{
    use Berry;


    /**
     * @param array{
     *   animal: (
     *    Cat
     *   |Dog
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->animal = $values['animal'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
