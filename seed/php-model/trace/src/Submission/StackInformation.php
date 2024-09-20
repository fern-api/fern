<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StackInformation extends SerializableType
{
    /**
     * @var int $numStackFrames
     */
    #[JsonProperty("numStackFrames")]
    public int $numStackFrames;

    /**
     * @var ?StackFrame $topStackFrame
     */
    #[JsonProperty("topStackFrame")]
    public ?StackFrame $topStackFrame;

    /**
     * @param array{
     *   numStackFrames: int,
     *   topStackFrame?: ?StackFrame,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->numStackFrames = $values['numStackFrames'];
        $this->topStackFrame = $values['topStackFrame'] ?? null;
    }
}
