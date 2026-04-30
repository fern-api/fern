<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LeafTypeB extends JsonSerializableType
{
    /**
     * @var string $gamma
     */
    #[JsonProperty('gamma')]
    public string $gamma;

    /**
     * @param array{
     *   gamma: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->gamma = $values['gamma'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
