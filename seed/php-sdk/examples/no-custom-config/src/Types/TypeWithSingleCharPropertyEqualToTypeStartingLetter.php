<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TypeWithSingleCharPropertyEqualToTypeStartingLetter extends JsonSerializableType
{
    /**
     * @var string $t
     */
    #[JsonProperty('t')]
    public string $t;

    /**
     * @var string $ty
     */
    #[JsonProperty('ty')]
    public string $ty;

    /**
     * @param array{
     *   t: string,
     *   ty: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->t = $values['t'];$this->ty = $values['ty'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
