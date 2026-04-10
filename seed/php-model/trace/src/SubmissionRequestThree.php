<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceSubmitRequest;
use Seed\Core\Json\JsonProperty;

class SubmissionRequestThree extends JsonSerializableType
{
    use WorkspaceSubmitRequest;

    /**
     * @var value-of<SubmissionRequestThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   language: value-of<Language>,
     *   submissionFiles: array<SubmissionFileInfo>,
     *   type: value-of<SubmissionRequestThreeType>,
     *   userId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->language = $values['language'];
        $this->submissionFiles = $values['submissionFiles'];
        $this->userId = $values['userId'] ?? null;
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
