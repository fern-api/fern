<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

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
     * @var mixed $variableType
     */
    #[JsonProperty('variableType')]
    public mixed $variableType;

    /**
     * @param array{
     *   parameterId: string,
     *   name: string,
     *   variableType: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameterId = $values['parameterId'];
        $this->name = $values['name'];
        $this->variableType = $values['variableType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
