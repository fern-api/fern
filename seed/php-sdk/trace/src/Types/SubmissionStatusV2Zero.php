<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TestSubmissionStatusV2;
use Seed\Core\Json\JsonProperty;

class SubmissionStatusV2Zero extends JsonSerializableType
{
    use TestSubmissionStatusV2;

    /**
     * @var value-of<SubmissionStatusV2ZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   updates: array<TestSubmissionUpdate>,
     *   problemId: string,
     *   problemVersion: int,
     *   problemInfo: V2ProblemInfoV2,
     *   type: value-of<SubmissionStatusV2ZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->updates = $values['updates'];
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'];
        $this->problemInfo = $values['problemInfo'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
