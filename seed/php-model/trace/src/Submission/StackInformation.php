<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StackInformation extends JsonSerializableType
{
    /**
     * @var int $numStackFrames
     */
    #[JsonProperty('numStackFrames')]
    public int $numStackFrames;

    /**
     * @var ?StackFrame $topStackFrame
     */
    #[JsonProperty('topStackFrame')]
    public ?StackFrame $topStackFrame;

    /**
     * @param array{
     *   numStackFrames: int,
     *   topStackFrame?: ?StackFrame,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->numStackFrames = $values['numStackFrames'];$this->topStackFrame = $values['topStackFrame'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
