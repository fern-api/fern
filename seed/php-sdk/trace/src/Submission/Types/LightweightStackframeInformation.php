<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

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
