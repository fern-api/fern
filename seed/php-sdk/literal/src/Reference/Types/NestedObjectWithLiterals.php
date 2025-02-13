<?php

namespace Seed\Reference\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedObjectWithLiterals extends JsonSerializableType
{
    /**
     * @var 'literal1' $literal1
     */
    #[JsonProperty('literal1')]
    public string $literal1;

    /**
     * @var 'literal2' $literal2
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
     *   strProp: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
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
