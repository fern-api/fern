<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\Types\TestSubmissionUpdate;
use Seed\V2\Problem\Types\ProblemInfoV2;

class TestSubmissionStatusV2 extends SerializableType
{
    #[JsonProperty("updates"), ArrayType([TestSubmissionUpdate])]
    /**
     * @var array<TestSubmissionUpdate> $updates
     */
    public array $updates;

    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("problemVersion")]
    /**
     * @var int $problemVersion
     */
    public int $problemVersion;

    #[JsonProperty("problemInfo")]
    /**
     * @var ProblemInfoV2 $problemInfo
     */
    public ProblemInfoV2 $problemInfo;

    /**
     * @param array<TestSubmissionUpdate> $updates
     * @param string $problemId
     * @param int $problemVersion
     * @param ProblemInfoV2 $problemInfo
     */
    public function __construct(
        array $updates,
        string $problemId,
        int $problemVersion,
        ProblemInfoV2 $problemInfo,
    ) {
        $this->updates = $updates;
        $this->problemId = $problemId;
        $this->problemVersion = $problemVersion;
        $this->problemInfo = $problemInfo;
    }
}
