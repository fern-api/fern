<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RootType extends SerializableType
{
    /**
     * @var string $s
     */
    #[JsonProperty("s")]
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
