<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\SubmitRequestV2;
use Seed\Core\Json\JsonProperty;

class SubmissionRequestTwo extends JsonSerializableType
{
    use SubmitRequestV2;

    /**
     * @var value-of<SubmissionRequestTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   language: value-of<Language>,
     *   submissionFiles: array<SubmissionFileInfo>,
     *   problemId: string,
     *   type: value-of<SubmissionRequestTwoType>,
     *   problemVersion?: ?int,
     *   userId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->language = $values['language'];
        $this->submissionFiles = $values['submissionFiles'];
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'] ?? null;
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
