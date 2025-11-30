<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InternalError extends JsonSerializableType
{
    /**
     * @var ExceptionInfo $exceptionInfo
     */
    #[JsonProperty('exceptionInfo')]
    public ExceptionInfo $exceptionInfo;

    /**
     * @param array{
     *   exceptionInfo: ExceptionInfo,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->exceptionInfo = $values['exceptionInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
