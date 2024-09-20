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
     * @param array{
     *   submissionId: string,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->stdout = $values['stdout'];
    }
}
