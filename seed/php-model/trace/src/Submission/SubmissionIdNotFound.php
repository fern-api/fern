<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SubmissionIdNotFound extends JsonSerializableType
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
    )
    {
        $this->missingSubmissionId = $values['missingSubmissionId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
