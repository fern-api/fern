<?php

namespace Seed\Traits;

use Seed\TestSubmissionUpdate;
use Seed\V2ProblemInfoV2;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<TestSubmissionUpdate> $updates
 * @property string $problemId
 * @property int $problemVersion
 * @property V2ProblemInfoV2 $problemInfo
 */
trait TestSubmissionStatusV2
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
}
