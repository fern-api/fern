<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ExceptionInfo extends JsonSerializableType
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
    )
    {
        $this->exceptionType = $values['exceptionType'];$this->exceptionMessage = $values['exceptionMessage'];$this->exceptionStacktrace = $values['exceptionStacktrace'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
