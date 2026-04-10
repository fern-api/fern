<?php

namespace Seed\Optional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendOptionalBodyRequest extends JsonSerializableType
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
