<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ExtendedMovie extends SerializableType
{
    #[JsonProperty("cast"), ArrayType(["string"])]
    /**
     * @var array<string> $cast
     */
    public array $cast;

    /**
     * @param array<string> $cast
     */
    public function __construct(
        array $cast,
    ) {
        $this->cast = $cast;
    }
}
