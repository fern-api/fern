<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class RootType extends SerializableType
{
    /**
     * @var string $s
     */
    #[JsonProperty('s')]
    public string $s;

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
