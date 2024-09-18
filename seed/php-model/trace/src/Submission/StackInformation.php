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
     * @param int $numStackFrames
     * @param ?StackFrame $topStackFrame
     */
    public function __construct(
        int $numStackFrames,
        ?StackFrame $topStackFrame = null,
    ) {
        $this->numStackFrames = $numStackFrames;
        $this->topStackFrame = $topStackFrame;
    }
}
