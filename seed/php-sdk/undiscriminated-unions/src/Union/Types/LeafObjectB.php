<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LeafObjectB extends JsonSerializableType
{
    /**
     * @var string $onlyInB
     */
    #[JsonProperty('onlyInB')]
    public string $onlyInB;

    /**
     * @param array{
     *   onlyInB: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->onlyInB = $values['onlyInB'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
