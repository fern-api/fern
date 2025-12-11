<?php

namespace Seed\Errors\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnauthorizedRequestErrorBody extends JsonSerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @param array{
     *   message: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->message = $values['message'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
