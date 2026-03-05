<?php

namespace Seed\Traits;

use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

/**
 * Base order schema with common order fields.
 *
 * @property string $orderId
 * @property float $amount
 * @property string $currency
 * @property ?DateTime $dateTime
 */
trait OrderBase
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
}
