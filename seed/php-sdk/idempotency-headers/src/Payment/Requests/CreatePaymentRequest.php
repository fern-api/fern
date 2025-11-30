<?php

namespace Seed\Payment\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Payment\Types\Currency;

class CreatePaymentRequest extends JsonSerializableType
{
    /**
     * @var int $amount
     */
    #[JsonProperty('amount')]
    public int $amount;

    /**
     * @var value-of<Currency> $currency
     */
    #[JsonProperty('currency')]
    public string $currency;

    /**
     * @param array{
     *   amount: int,
     *   currency: value-of<Currency>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->amount = $values['amount'];$this->currency = $values['currency'];
    }
}
