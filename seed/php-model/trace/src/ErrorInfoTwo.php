<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\InternalError;
use Seed\Core\Json\JsonProperty;

class ErrorInfoTwo extends JsonSerializableType
{
    use InternalError;

    /**
     * @var value-of<ErrorInfoTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   exceptionInfo: ExceptionInfo,
     *   type: value-of<ErrorInfoTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionInfo = $values['exceptionInfo'];
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
