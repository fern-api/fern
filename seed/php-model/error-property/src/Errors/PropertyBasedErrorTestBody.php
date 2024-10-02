<?php

namespace Seed\Errors;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class PropertyBasedErrorTestBody extends SerializableType
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
