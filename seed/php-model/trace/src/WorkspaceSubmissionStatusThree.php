<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceRunDetails;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionStatusThree extends JsonSerializableType
{
    use WorkspaceRunDetails;

    /**
     * @var value-of<WorkspaceSubmissionStatusThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   stdout: string,
     *   type: value-of<WorkspaceSubmissionStatusThreeType>,
     *   exceptionV2?: (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null,
     *   exception?: ?ExceptionInfo,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionV2 = $values['exceptionV2'] ?? null;
        $this->exception = $values['exception'] ?? null;
        $this->stdout = $values['stdout'];
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
