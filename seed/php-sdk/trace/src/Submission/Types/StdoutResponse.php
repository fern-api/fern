<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StdoutResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("stdout")]
    /**
     * @var string $stdout
     */
    public string $stdout;

    /**
     * @param string $submissionId
     * @param string $stdout
     */
    public function __construct(
        string $submissionId,
        string $stdout,
    ) {
        $this->submissionId = $submissionId;
        $this->stdout = $stdout;
    }
}
