<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ExtendedMovie extends SerializableType
{
    /**
     * @var array<string> $cast
     */
    #[JsonProperty("cast"), ArrayType(["string"])]
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
