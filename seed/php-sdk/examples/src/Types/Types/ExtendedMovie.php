<?php

namespace Seed\Types\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

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
