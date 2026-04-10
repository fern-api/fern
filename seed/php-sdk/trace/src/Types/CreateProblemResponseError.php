<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateProblemResponseError extends JsonSerializableType
{
    /**
     * @var ?CreateProblemError $value
     */
    #[JsonProperty('value')]
    public ?CreateProblemError $value;

    /**
     * @param array{
     *   value?: ?CreateProblemError,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
