<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RefundProcessedPayload extends JsonSerializableType
{
    /**
     * @var string $refundId
     */
    #[JsonProperty('refundId')]
    public string $refundId;

    /**
     * @var float $amount
     */
    #[JsonProperty('amount')]
    public float $amount;

    /**
     * @var ?string $reason
     */
    #[JsonProperty('reason')]
    public ?string $reason;

    /**
     * @param array{
     *   refundId: string,
     *   amount: float,
     *   reason?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->refundId = $values['refundId'];
        $this->amount = $values['amount'];
        $this->reason = $values['reason'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
