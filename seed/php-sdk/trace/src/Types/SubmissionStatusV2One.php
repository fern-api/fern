<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceSubmissionStatusV2;
use Seed\Core\Json\JsonProperty;

class SubmissionStatusV2One extends JsonSerializableType
{
    use WorkspaceSubmissionStatusV2;

    /**
     * @var value-of<SubmissionStatusV2OneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   updates: array<WorkspaceSubmissionUpdate>,
     *   type: value-of<SubmissionStatusV2OneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->updates = $values['updates'];
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
