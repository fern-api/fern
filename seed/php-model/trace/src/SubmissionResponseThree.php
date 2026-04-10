<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ExceptionInfo;
use Seed\Core\Json\JsonProperty;

class SubmissionResponseThree extends JsonSerializableType
{
    use ExceptionInfo;

    /**
     * @var value-of<SubmissionResponseThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   exceptionType: string,
     *   exceptionMessage: string,
     *   exceptionStacktrace: string,
     *   type: value-of<SubmissionResponseThreeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionType = $values['exceptionType'];
        $this->exceptionMessage = $values['exceptionMessage'];
        $this->exceptionStacktrace = $values['exceptionStacktrace'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
