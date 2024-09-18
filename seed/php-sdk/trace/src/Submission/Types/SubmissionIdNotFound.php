<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SubmissionIdNotFound extends SerializableType
{
    /**
     * @var string $missingSubmissionId
     */
    #[JsonProperty("missingSubmissionId")]
    public string $missingSubmissionId;

    /**
     * @param string $missingSubmissionId
     */
    public function __construct(
        string $missingSubmissionId,
    ) {
        $this->missingSubmissionId = $missingSubmissionId;
    }
}
