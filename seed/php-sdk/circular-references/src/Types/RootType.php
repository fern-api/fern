<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RootType extends JsonSerializableType
{
    /**
     * @var string $s
     */
    #[JsonProperty('s')]
    public string $s;

    /**
     * @param array{
     *   s: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->s = $values['s'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
