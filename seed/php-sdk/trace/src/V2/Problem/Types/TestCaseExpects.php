<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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
        array $values,
    ) {
        $this->expectedStdout = $values['expectedStdout'] ?? null;
    }
}
