<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TokenizeCard extends JsonSerializableType
{
    /**
     * @var string $method
     */
    #[JsonProperty('method')]
    public string $method;

    /**
     * @var string $cardNumber
     */
    #[JsonProperty('cardNumber')]
    public string $cardNumber;

    /**
     * @param array{
     *   method: string,
     *   cardNumber: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->method = $values['method'];$this->cardNumber = $values['cardNumber'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
