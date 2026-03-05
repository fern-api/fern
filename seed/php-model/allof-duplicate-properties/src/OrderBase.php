<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

/**
 * Base order schema with common order fields.
 */
class OrderBase extends JsonSerializableType
{
    /**
     * @var string $orderId Unique identifier for the order.
     */
    #[JsonProperty('orderId')]
    public string $orderId;

    /**
     * @var float $amount Total amount for the order.
     */
    #[JsonProperty('amount')]
    public float $amount;

    /**
     * @var string $currency Currency code (e.g. USD, EUR).
     */
    #[JsonProperty('currency')]
    public string $currency;

    /**
     * @var ?DateTime $dateTime Timestamp when the order was placed.
     */
    #[JsonProperty('dateTime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $dateTime;

    /**
     * @param array{
     *   orderId: string,
     *   amount: float,
     *   currency: string,
     *   dateTime?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->orderId = $values['orderId'];
        $this->amount = $values['amount'];
        $this->currency = $values['currency'];
        $this->dateTime = $values['dateTime'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
