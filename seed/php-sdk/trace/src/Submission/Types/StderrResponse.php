<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StderrResponse extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var string $stderr
     */
    #[JsonProperty('stderr')]
    public string $stderr;

    /**
     * @param array{
     *   submissionId: string,
     *   stderr: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->stderr = $values['stderr'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
