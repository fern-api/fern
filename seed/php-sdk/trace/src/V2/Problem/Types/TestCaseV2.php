<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TestCaseV2 extends SerializableType
{
    /**
     * @var TestCaseMetadata $metadata
     */
    #[JsonProperty("metadata")]
    public TestCaseMetadata $metadata;

    /**
     * @var mixed $implementation
     */
    #[JsonProperty("implementation")]
    public mixed $implementation;

    /**
     * @var array<string, mixed> $arguments
     */
    #[JsonProperty("arguments"), ArrayType(["string" => "mixed"])]
    public array $arguments;

    /**
     * @var ?TestCaseExpects $expects
     */
    #[JsonProperty("expects")]
    public ?TestCaseExpects $expects;

    /**
     * @param TestCaseMetadata $metadata
     * @param mixed $implementation
     * @param array<string, mixed> $arguments
     * @param ?TestCaseExpects $expects
     */
    public function __construct(
        TestCaseMetadata $metadata,
        mixed $implementation,
        array $arguments,
        ?TestCaseExpects $expects = null,
    ) {
        $this->metadata = $metadata;
        $this->implementation = $implementation;
        $this->arguments = $arguments;
        $this->expects = $expects;
    }
}
