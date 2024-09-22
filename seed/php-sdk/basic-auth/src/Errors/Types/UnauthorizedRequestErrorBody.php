<?php

namespace Seed\Errors\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UnauthorizedRequestErrorBody extends SerializableType
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
    ) {
        $this->message = $values['message'];
    }
}
