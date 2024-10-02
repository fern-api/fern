<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ExceptionInfo extends SerializableType
{
    /**
     * @var string $exceptionType
     */
    #[JsonProperty('exceptionType')]
    public string $exceptionType;

    /**
     * @var string $exceptionMessage
     */
    #[JsonProperty('exceptionMessage')]
    public string $exceptionMessage;

    /**
     * @var string $exceptionStacktrace
     */
    #[JsonProperty('exceptionStacktrace')]
    public string $exceptionStacktrace;

    /**
     * @param array{
     *   exceptionType: string,
     *   exceptionMessage: string,
     *   exceptionStacktrace: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionType = $values['exceptionType'];
        $this->exceptionMessage = $values['exceptionMessage'];
        $this->exceptionStacktrace = $values['exceptionStacktrace'];
    }
}
