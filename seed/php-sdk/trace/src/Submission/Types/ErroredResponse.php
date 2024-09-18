<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ErroredResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var mixed $errorInfo
     */
    #[JsonProperty("errorInfo")]
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
