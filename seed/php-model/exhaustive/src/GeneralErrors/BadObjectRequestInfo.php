<?php

namespace Seed\GeneralErrors;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BadObjectRequestInfo extends SerializableType
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
