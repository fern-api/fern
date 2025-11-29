<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ErroredResponse extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var ErrorInfo $errorInfo
     */
    #[JsonProperty('errorInfo')]
    public ErrorInfo $errorInfo;

    /**
     * @param array{
     *   submissionId: string,
     *   errorInfo: ErrorInfo,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->errorInfo = $values['errorInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
