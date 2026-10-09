<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ExactRefundRequest extends JsonSerializableType
{
    /**
     * @var float $amount
     */
    #[JsonProperty('amount')]
    public float $amount;

    /**
     * @param array{
     *   amount: float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->amount = $values['amount'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
