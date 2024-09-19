<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StdoutResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var string $stdout
     */
    #[JsonProperty("stdout")]
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
