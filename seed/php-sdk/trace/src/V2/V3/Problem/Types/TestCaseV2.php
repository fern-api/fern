<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\TestCaseMetadata;
use Seed\Core\ArrayType;
use Seed\V2\V3\Problem\Types\TestCaseExpects;

class TestCaseV2 extends SerializableType
{
    #[JsonProperty("metadata")]
    /**
     * @var TestCaseMetadata $metadata
     */
    public TestCaseMetadata $metadata;

    #[JsonProperty("implementation")]
    /**
     * @var mixed $implementation
     */
    public mixed $implementation;

    #[JsonProperty("arguments"), ArrayType(["string" => "mixed"])]
    /**
     * @var array<string, mixed> $arguments
     */
    public array $arguments;

    #[JsonProperty("expects")]
    /**
     * @var ?TestCaseExpects $expects
     */
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
