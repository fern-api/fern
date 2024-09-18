<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StopRequest extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
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
