<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $problemId
 * @property ?int $problemVersion
 */
trait InitializeProblemRequest
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var ?int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public ?int $problemVersion;
}
