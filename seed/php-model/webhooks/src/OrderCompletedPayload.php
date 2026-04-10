<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OrderCompletedPayload extends JsonSerializableType
{
    /**
     * @var string $orderId
     */
    #[JsonProperty('orderId')]
    public string $orderId;

    /**
     * @var float $total
     */
    #[JsonProperty('total')]
    public float $total;

    /**
     * @var string $currency
     */
    #[JsonProperty('currency')]
    public string $currency;

    /**
     * @param array{
     *   orderId: string,
     *   total: float,
     *   currency: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->orderId = $values['orderId'];
        $this->total = $values['total'];
        $this->currency = $values['currency'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
