<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class TestCaseV2 extends JsonSerializableType
{
    /**
     * @var TestCaseMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public TestCaseMetadata $metadata;

    /**
     * @var mixed $implementation
     */
    #[JsonProperty('implementation')]
    public mixed $implementation;

    /**
     * @var array<string, mixed> $arguments
     */
    #[JsonProperty('arguments'), ArrayType(['string' => 'mixed'])]
    public array $arguments;

    /**
     * @var ?TestCaseExpects $expects
     */
    #[JsonProperty('expects')]
    public ?TestCaseExpects $expects;

    /**
     * @param array{
     *   metadata: TestCaseMetadata,
     *   implementation: mixed,
     *   arguments: array<string, mixed>,
     *   expects?: ?TestCaseExpects,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->metadata = $values['metadata'];
        $this->implementation = $values['implementation'];
        $this->arguments = $values['arguments'];
        $this->expects = $values['expects'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
