<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RunningResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateOne extends JsonSerializableType
{
    use RunningResponse;

    /**
     * @var value-of<CodeExecutionUpdateOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   state: value-of<RunningSubmissionState>,
     *   type: value-of<CodeExecutionUpdateOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->state = $values['state'];
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
