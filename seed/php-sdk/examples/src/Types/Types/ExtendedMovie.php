<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ExtendedMovie extends SerializableType
{
    /**
     * @var array<string> $cast
     */
    #[JsonProperty('cast'), ArrayType(['string'])]
    public array $cast;

    /**
     * @param array{
     *   cast: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->cast = $values['cast'];
    }
}
