<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class LightweightProblemInfoV2 extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var string $problemName
     */
    #[JsonProperty("problemName")]
    public string $problemName;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty("problemVersion")]
    public int $problemVersion;

    /**
     * @var array<mixed> $variableTypes
     */
    #[JsonProperty("variableTypes"), ArrayType(["mixed"])]
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
