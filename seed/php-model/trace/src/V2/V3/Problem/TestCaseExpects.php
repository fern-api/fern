<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseExpects extends SerializableType
{
    #[JsonProperty("expectedStdout")]
    /**
     * @var ?string $expectedStdout
     */
    public ?string $expectedStdout;

    /**
     * @param ?string $expectedStdout
     */
    public function __construct(
        ?string $expectedStdout = null,
    ) {
        $this->expectedStdout = $expectedStdout;
    }
}
