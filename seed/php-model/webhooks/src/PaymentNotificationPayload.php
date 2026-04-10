<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PaymentNotificationPayload extends JsonSerializableType
{
    /**
     * @var string $paymentId
     */
    #[JsonProperty('paymentId')]
    public string $paymentId;

    /**
     * @var float $amount
     */
    #[JsonProperty('amount')]
    public float $amount;

    /**
     * @var string $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   paymentId: string,
     *   amount: float,
     *   status: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->paymentId = $values['paymentId'];
        $this->amount = $values['amount'];
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
