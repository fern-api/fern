<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseExpects extends SerializableType
{
    /**
     * @var ?string $expectedStdout
     */
    #[JsonProperty('expectedStdout')]
    public ?string $expectedStdout;

    /**
     * @param array{
     *   expectedStdout?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->expectedStdout = $values['expectedStdout'] ?? null;
    }
}
