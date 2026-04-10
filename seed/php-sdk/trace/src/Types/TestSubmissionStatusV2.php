<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

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
     * @var V2ProblemInfoV2 $problemInfo
     */
    #[JsonProperty('problemInfo')]
    public V2ProblemInfoV2 $problemInfo;

    /**
     * @param array{
     *   updates: array<TestSubmissionUpdate>,
     *   problemId: string,
     *   problemVersion: int,
     *   problemInfo: V2ProblemInfoV2,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->updates = $values['updates'];
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'];
        $this->problemInfo = $values['problemInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
