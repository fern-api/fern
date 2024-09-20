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
     * @param array{
     *   problemId: string,
     *   problemName: string,
     *   problemVersion: int,
     *   variableTypes: array<mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->problemName = $values['problemName'];
        $this->problemVersion = $values['problemVersion'];
        $this->variableTypes = $values['variableTypes'];
    }
}
