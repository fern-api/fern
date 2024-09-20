<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CustomTestCasesUnsupported extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @param array{
     *   problemId: string,
     *   submissionId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->submissionId = $values['submissionId'];
    }
}
