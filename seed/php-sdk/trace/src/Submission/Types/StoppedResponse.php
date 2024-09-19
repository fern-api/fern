<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StoppedResponse extends SerializableType
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
