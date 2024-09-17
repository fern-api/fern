<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ErroredResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("errorInfo")]
    /**
     * @var mixed $errorInfo
     */
    public mixed $errorInfo;

    /**
     * @param string $submissionId
     * @param mixed $errorInfo
     */
    public function __construct(
        string $submissionId,
        mixed $errorInfo,
    ) {
        $this->submissionId = $submissionId;
        $this->errorInfo = $errorInfo;
    }
}
