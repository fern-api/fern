<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $problemId
 * @property string $submissionId
 */
trait CustomTestCasesUnsupported
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;
}
