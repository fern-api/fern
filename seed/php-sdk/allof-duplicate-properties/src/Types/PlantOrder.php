<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\OrderBase;
use Seed\Core\Json\JsonProperty;
use DateTime;

/**
 * A plant order that extends OrderBase via allOf but also redefines amount, currency, and orderId inline. Each property should appear only once in the generated type.
 */
class PlantOrder extends JsonSerializableType
{
    use OrderBase;

    /**
     * @var string $plantName Name of the plant being ordered.
     */
    #[JsonProperty('plantName')]
    public string $plantName;

    /**
     * @var ?int $quantity Number of plants ordered.
     */
    #[JsonProperty('quantity')]
    public ?int $quantity;

    /**
     * @param array{
     *   orderId: string,
     *   amount: float,
     *   currency: string,
     *   plantName: string,
     *   dateTime?: ?DateTime,
     *   quantity?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->orderId = $values['orderId'];
        $this->amount = $values['amount'];
        $this->currency = $values['currency'];
        $this->dateTime = $values['dateTime'] ?? null;
        $this->plantName = $values['plantName'];
        $this->quantity = $values['quantity'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
