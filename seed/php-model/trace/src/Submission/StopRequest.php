<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StopRequest extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @param array{
     *   submissionId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
