<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\Problem\Types\ProblemInfoV2;

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
