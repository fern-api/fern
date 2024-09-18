<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InitializeProblemRequest extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var ?int $problemVersion
     */
    #[JsonProperty("problemVersion")]
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
