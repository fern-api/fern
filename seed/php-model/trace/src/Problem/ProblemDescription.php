<?php

namespace Seed\Problem;

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
     * @param array<mixed> $boards
     */
    public function __construct(
        array $boards,
    ) {
        $this->boards = $boards;
    }
}
