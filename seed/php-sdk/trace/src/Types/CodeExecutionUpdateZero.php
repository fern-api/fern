<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BuildingExecutorResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateZero extends JsonSerializableType
{
    use BuildingExecutorResponse;

    /**
     * @var value-of<CodeExecutionUpdateZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   status: value-of<ExecutionSessionStatus>,
     *   type: value-of<CodeExecutionUpdateZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->status = $values['status'];
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
