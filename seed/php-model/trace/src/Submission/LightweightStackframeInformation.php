<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class LightweightStackframeInformation extends SerializableType
{
    /**
     * @var int $numStackFrames
     */
    #[JsonProperty('numStackFrames')]
    public int $numStackFrames;

    /**
     * @var string $topStackFrameMethodName
     */
    #[JsonProperty('topStackFrameMethodName')]
    public string $topStackFrameMethodName;

    /**
     * @param array{
     *   numStackFrames: int,
     *   topStackFrameMethodName: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->numStackFrames = $values['numStackFrames'];
        $this->topStackFrameMethodName = $values['topStackFrameMethodName'];
    }
}
