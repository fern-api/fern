<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\VariableType;
use Seed\Core\Types\ArrayType;

class LightweightProblemInfoV2 extends JsonSerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var string $problemName
     */
    #[JsonProperty('problemName')]
    public string $problemName;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public int $problemVersion;

    /**
     * @var array<VariableType> $variableTypes
     */
    #[JsonProperty('variableTypes'), ArrayType([VariableType::class])]
    public array $variableTypes;

    /**
     * @param array{
     *   problemId: string,
     *   problemName: string,
     *   problemVersion: int,
     *   variableTypes: array<VariableType>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemId = $values['problemId'];$this->problemName = $values['problemName'];$this->problemVersion = $values['problemVersion'];$this->variableTypes = $values['variableTypes'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
