<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class LightweightProblemInfoV2 extends SerializableType
{
    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("problemName")]
    /**
     * @var string $problemName
     */
    public string $problemName;

    #[JsonProperty("problemVersion")]
    /**
     * @var int $problemVersion
     */
    public int $problemVersion;

    #[JsonProperty("variableTypes"), ArrayType(["mixed"])]
    /**
     * @var array<mixed> $variableTypes
     */
    public array $variableTypes;

    /**
     * @param string $problemId
     * @param string $problemName
     * @param int $problemVersion
     * @param array<mixed> $variableTypes
     */
    public function __construct(
        string $problemId,
        string $problemName,
        int $problemVersion,
        array $variableTypes,
    ) {
        $this->problemId = $problemId;
        $this->problemName = $problemName;
        $this->problemVersion = $problemVersion;
        $this->variableTypes = $variableTypes;
    }
}
