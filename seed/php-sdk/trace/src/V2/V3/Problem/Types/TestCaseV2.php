<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\VariableValue;
use Seed\Core\Types\ArrayType;

class TestCaseV2 extends JsonSerializableType
{
    /**
     * @var TestCaseMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public TestCaseMetadata $metadata;

    /**
     * @var TestCaseImplementationReference $implementation
     */
    #[JsonProperty('implementation')]
    public TestCaseImplementationReference $implementation;

    /**
     * @var array<string, VariableValue> $arguments
     */
    #[JsonProperty('arguments'), ArrayType(['string' => VariableValue::class])]
    public array $arguments;

    /**
     * @var ?TestCaseExpects $expects
     */
    #[JsonProperty('expects')]
    public ?TestCaseExpects $expects;

    /**
     * @param array{
     *   metadata: TestCaseMetadata,
     *   implementation: TestCaseImplementationReference,
     *   arguments: array<string, VariableValue>,
     *   expects?: ?TestCaseExpects,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->metadata = $values['metadata'];$this->implementation = $values['implementation'];$this->arguments = $values['arguments'];$this->expects = $values['expects'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
