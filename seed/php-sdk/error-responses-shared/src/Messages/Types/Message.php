<?php

namespace Seed\Messages\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Message extends JsonSerializableType
{
    /**
     * @var string $sid
     */
    #[JsonProperty('sid')]
    public string $sid;

    /**
     * @var string $body
     */
    #[JsonProperty('body')]
    public string $body;

    /**
     * @param array{
     *   sid: string,
     *   body: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->sid = $values['sid'];
        $this->body = $values['body'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
