<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UpdateFooRequest extends JsonSerializableType
{
    /**
     * @var string $xIdempotencyKey
     */
    public string $xIdempotencyKey;

    /**
     * @var ?string $nullableText Can be explicitly set to null to clear the value
     */
    #[JsonProperty('nullable_text')]
    public ?string $nullableText;

    /**
     * @var ?float $nullableNumber Can be explicitly set to null to clear the value
     */
    #[JsonProperty('nullable_number')]
    public ?float $nullableNumber;

    /**
     * @var ?string $nonNullableText Regular non-nullable field
     */
    #[JsonProperty('non_nullable_text')]
    public ?string $nonNullableText;

    /**
     * @var ?string $requiredNullableText Must be sent, but may be null to clear the value
     */
    #[JsonProperty('required_nullable_text')]
    public ?string $requiredNullableText;

    /**
     * @param array{
     *   xIdempotencyKey: string,
     *   nullableText?: ?string,
     *   nullableNumber?: ?float,
     *   nonNullableText?: ?string,
     *   requiredNullableText?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->xIdempotencyKey = $values['xIdempotencyKey'];
        $this->nullableText = $values['nullableText'] ?? null;
        $this->nullableNumber = $values['nullableNumber'] ?? null;
        $this->nonNullableText = $values['nonNullableText'] ?? null;
        $this->requiredNullableText = $values['requiredNullableText'] ?? null;
    }
}
