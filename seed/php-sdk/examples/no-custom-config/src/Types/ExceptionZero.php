<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ExceptionInfo;
use Seed\Core\Json\JsonProperty;

class ExceptionZero extends JsonSerializableType
{
    use ExceptionInfo;

    /**
     * @var value-of<ExceptionZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   exceptionType: string,
     *   exceptionMessage: string,
     *   exceptionStacktrace: string,
     *   type: value-of<ExceptionZeroType>,
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
