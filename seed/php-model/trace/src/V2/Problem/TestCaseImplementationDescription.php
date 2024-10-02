<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class TestCaseImplementationDescription extends SerializableType
{
    /**
     * @var array<mixed> $boards
     */
    #[JsonProperty('boards'), ArrayType(['mixed'])]
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
