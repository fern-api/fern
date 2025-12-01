<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\V2\Problem\Types\ProblemInfoV2;

class TestSubmissionStatusV2 extends JsonSerializableType
{
    /**
     * @var array<TestSubmissionUpdate> $updates
     */
    #[JsonProperty('updates'), ArrayType([TestSubmissionUpdate::class])]
    public array $updates;

    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public int $problemVersion;

    /**
     * @var ProblemInfoV2 $problemInfo
     */
    #[JsonProperty('problemInfo')]
    public ProblemInfoV2 $problemInfo;

    /**
     * @param array{
     *   updates: array<TestSubmissionUpdate>,
     *   problemId: string,
     *   problemVersion: int,
     *   problemInfo: ProblemInfoV2,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->updates = $values['updates'];$this->problemId = $values['problemId'];$this->problemVersion = $values['problemVersion'];$this->problemInfo = $values['problemInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
