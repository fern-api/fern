<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Child extends SerializableType
{
    /**
     * @var string $child
     */
    #[JsonProperty('child')]
    public string $child;

    /**
     * @param array{
     *   child: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->child = $values['child'];
    }
}
