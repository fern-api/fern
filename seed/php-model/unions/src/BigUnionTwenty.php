<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UnwillingSmoke;
use Seed\Core\Json\JsonProperty;

class BigUnionTwenty extends JsonSerializableType
{
    use UnwillingSmoke;

    /**
     * @var value-of<BigUnionTwentyType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwentyType>,
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
