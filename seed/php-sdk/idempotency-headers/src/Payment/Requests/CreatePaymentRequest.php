<?php

namespace Seed\Payment\Requests;

use Seed\Core\JsonProperty;
use Seed\Payment\Types\Currency;

class CreatePaymentRequest
{
    /**
     * @var int $amount
     */
    #[JsonProperty("amount")]
    public int $amount;

    /**
     * @var Currency $currency
     */
    #[JsonProperty("currency")]
    public Currency $currency;

}
