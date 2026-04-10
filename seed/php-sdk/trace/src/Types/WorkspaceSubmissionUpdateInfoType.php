<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionUpdateInfoType extends JsonSerializableType
{
    /**
     * @var value-of<WorkspaceSubmissionUpdateInfoTypeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<WorkspaceSubmissionUpdateInfoTypeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
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
