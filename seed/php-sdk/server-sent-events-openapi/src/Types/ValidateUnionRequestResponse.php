<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ValidateUnionRequestResponse extends JsonSerializableType
{
    /**
     * @var ?bool $valid
     */
    #[JsonProperty('valid')]
    public ?bool $valid;

    /**
     * @param array{
     *   valid?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->valid = $values['valid'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
