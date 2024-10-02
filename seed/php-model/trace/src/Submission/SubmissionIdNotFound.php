<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class SubmissionIdNotFound extends SerializableType
{
    /**
     * @var string $missingSubmissionId
     */
    #[JsonProperty('missingSubmissionId')]
    public string $missingSubmissionId;

    /**
     * @param array{
     *   missingSubmissionId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->missingSubmissionId = $values['missingSubmissionId'];
    }
}
