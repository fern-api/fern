<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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
