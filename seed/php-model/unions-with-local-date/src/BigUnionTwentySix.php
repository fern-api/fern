<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PotableBad;
use Seed\Core\Json\JsonProperty;

class BigUnionTwentySix extends JsonSerializableType
{
    use PotableBad;

    /**
     * @var value-of<BigUnionTwentySixType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentySixType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
