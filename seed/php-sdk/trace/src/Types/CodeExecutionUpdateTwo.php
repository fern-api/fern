<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ErroredResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateTwo extends JsonSerializableType
{
    use ErroredResponse;

    /**
     * @var value-of<CodeExecutionUpdateTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   errorInfo: (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * ),
     *   type: value-of<CodeExecutionUpdateTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->errorInfo = $values['errorInfo'];
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
