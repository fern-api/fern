<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CustomTestCasesUnsupported extends JsonSerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @param array{
     *   problemId: string,
     *   submissionId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemId = $values['problemId'];$this->submissionId = $values['submissionId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
