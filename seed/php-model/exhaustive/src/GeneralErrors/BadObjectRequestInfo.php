<?php

namespace Seed\GeneralErrors;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

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
