<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InitializeProblemRequest extends SerializableType
{
    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("problemVersion")]
    /**
     * @var ?int $problemVersion
     */
    public ?int $problemVersion;

    /**
     * @param string $problemId
     * @param ?int $problemVersion
     */
    public function __construct(
        string $problemId,
        ?int $problemVersion = null,
    ) {
        $this->problemId = $problemId;
        $this->problemVersion = $problemVersion;
    }
}
