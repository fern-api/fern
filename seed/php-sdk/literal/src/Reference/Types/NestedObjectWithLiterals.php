<?php

namespace Seed\Reference\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedObjectWithLiterals extends JsonSerializableType
{
    /**
     * @var string $literal1
     */
    #[JsonProperty('literal1')]
    public string $literal1;

    /**
     * @var string $literal2
     */
    #[JsonProperty('literal2')]
    public string $literal2;

    /**
     * @var string $strProp
     */
    #[JsonProperty('strProp')]
    public string $strProp;

    /**
     * @param array{
     *   literal1: string,
     *   literal2: string,
     *   strProp: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->literal1 = $values['literal1'];
        $this->literal2 = $values['literal2'];
        $this->strProp = $values['strProp'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
