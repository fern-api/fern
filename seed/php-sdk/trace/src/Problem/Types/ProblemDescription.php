<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ProblemDescription extends SerializableType
{
    #[JsonProperty("boards"), ArrayType(["mixed"])]
    /**
     * @var array<mixed> $boards
     */
    public array $boards;

    /**
     * @param array<mixed> $boards
     */
    public function __construct(
        array $boards,
    ) {
        $this->boards = $boards;
    }
}
