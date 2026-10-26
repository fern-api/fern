<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ServiceErrorResponseErrorsItem extends JsonSerializableType
{
    /**
     * @var ?string $field
     */
    #[JsonProperty('field')]
    public ?string $field;

    /**
     * @var ?string $message
     */
    #[JsonProperty('message')]
    public ?string $message;

    /**
     * @param array{
     *   field?: ?string,
     *   message?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->field = $values['field'] ?? null;
        $this->message = $values['message'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
