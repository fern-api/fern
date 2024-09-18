<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StderrResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("stderr")]
    /**
     * @var string $stderr
     */
    public string $stderr;

    /**
     * @param string $submissionId
     * @param string $stderr
     */
    public function __construct(
        string $submissionId,
        string $stderr,
    ) {
        $this->submissionId = $submissionId;
        $this->stderr = $stderr;
    }
}
