<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PostSubmitResponse extends JsonSerializableType
{
    /**
     * @var ?string $status
     */
    #[JsonProperty('status')]
    public ?string $status;

    /**
     * @var ?string $message
     */
    #[JsonProperty('message')]
    public ?string $message;

    /**
     * @param array{
     *   status?: ?string,
     *   message?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->status = $values['status'] ?? null;
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
