<?php

namespace Seed\Union\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Union\Types\TokenizeCard;
use Seed\Union\Types\ConvertToken;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class PaymentRequest extends JsonSerializableType
{
    /**
     * @var (
     *    TokenizeCard
     *   |ConvertToken
     * ) $paymentMethod
     */
    #[JsonProperty('paymentMethod'), Union(TokenizeCard::class,ConvertToken::class)]
    public TokenizeCard|ConvertToken $paymentMethod;

    /**
     * @param array{
     *   paymentMethod: (
     *    TokenizeCard
     *   |ConvertToken
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->paymentMethod = $values['paymentMethod'];
    }
}
