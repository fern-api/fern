<?php

namespace Seed\Bigunion\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GaseousRoad extends JsonSerializableType
{
    /**
     * @var string $value
     */
    #[JsonProperty('value')]
    public string $value;

    /**
     * @param array{
     *   value: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
