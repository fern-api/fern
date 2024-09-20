<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\Problem\ProblemInfoV2;

class TestSubmissionStatusV2 extends SerializableType
{
    /**
     * @var array<TestSubmissionUpdate> $updates
     */
    #[JsonProperty("updates"), ArrayType([TestSubmissionUpdate::class])]
    public array $updates;

    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty("problemVersion")]
    public int $problemVersion;

    /**
     * @var ProblemInfoV2 $problemInfo
     */
    #[JsonProperty("problemInfo")]
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
    ) {
        $this->updates = $values['updates'];
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'];
        $this->problemInfo = $values['problemInfo'];
    }
}
