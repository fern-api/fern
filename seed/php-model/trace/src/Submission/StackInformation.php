<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\StackFrame;

class StackInformation extends SerializableType
{
    #[JsonProperty("numStackFrames")]
    /**
     * @var int $numStackFrames
     */
    public int $numStackFrames;

    #[JsonProperty("topStackFrame")]
    /**
     * @var ?StackFrame $topStackFrame
     */
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
