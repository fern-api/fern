<?php

namespace Seed\Submission;

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
     * @param array{
     *   submissionId: string,
     *   errorInfo: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->errorInfo = $values['errorInfo'];
    }
}
