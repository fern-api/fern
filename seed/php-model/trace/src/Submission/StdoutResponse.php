<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StdoutResponse extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;

    /**
     * @param array{
     *   submissionId: string,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->stdout = $values['stdout'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
