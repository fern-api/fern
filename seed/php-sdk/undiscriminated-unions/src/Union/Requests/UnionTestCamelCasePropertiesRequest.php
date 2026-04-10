<?php

namespace Seed\Union\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TokenizeCard;
use Seed\Types\ConvertToken;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class UnionTestCamelCasePropertiesRequest extends JsonSerializableType
{
    /**
     * @var (
     *    TokenizeCard
     *   |ConvertToken
     * ) $paymentMethod
     */
    #[JsonProperty('paymentMethod'), Union(TokenizeCard::class, ConvertToken::class)]
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
    ) {
        $this->paymentMethod = $values['paymentMethod'];
    }
}
