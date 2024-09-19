<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ProblemDescription extends SerializableType
{
    /**
     * @var array<mixed> $boards
     */
    #[JsonProperty("boards"), ArrayType(["mixed"])]
    public array $boards;

    /**
     * @param array{
     *   boards: array<mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->boards = $values['boards'];
    }
}
