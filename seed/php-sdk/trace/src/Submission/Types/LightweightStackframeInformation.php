<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LightweightStackframeInformation extends JsonSerializableType
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
    )
    {
        $this->numStackFrames = $values['numStackFrames'];$this->topStackFrameMethodName = $values['topStackFrameMethodName'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
