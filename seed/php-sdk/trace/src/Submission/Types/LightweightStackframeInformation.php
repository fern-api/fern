<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class LightweightStackframeInformation extends SerializableType
{
    #[JsonProperty("numStackFrames")]
    /**
     * @var int $numStackFrames
     */
    public int $numStackFrames;

    #[JsonProperty("topStackFrameMethodName")]
    /**
     * @var string $topStackFrameMethodName
     */
    public string $topStackFrameMethodName;

    /**
     * @param int $numStackFrames
     * @param string $topStackFrameMethodName
     */
    public function __construct(
        int $numStackFrames,
        string $topStackFrameMethodName,
    ) {
        $this->numStackFrames = $numStackFrames;
        $this->topStackFrameMethodName = $topStackFrameMethodName;
    }
}
