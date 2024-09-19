<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FinishedResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @param string $submissionId
     */
    public function __construct(
        string $submissionId,
    ) {
        $this->submissionId = $submissionId;
    }
}
