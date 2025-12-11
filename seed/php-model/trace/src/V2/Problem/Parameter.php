<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\VariableType;

class Parameter extends JsonSerializableType
{
    /**
     * @var string $parameterId
     */
    #[JsonProperty('parameterId')]
    public string $parameterId;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var VariableType $variableType
     */
    #[JsonProperty('variableType')]
    public VariableType $variableType;

    /**
     * @param array{
     *   parameterId: string,
     *   name: string,
     *   variableType: VariableType,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->parameterId = $values['parameterId'];$this->name = $values['name'];$this->variableType = $values['variableType'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
