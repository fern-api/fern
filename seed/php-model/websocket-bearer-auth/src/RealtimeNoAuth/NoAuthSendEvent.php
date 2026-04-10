<?php

namespace Seed\RealtimeNoAuth;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NoAuthSendEvent extends JsonSerializableType
{
    /**
     * @var string $text
     */
    #[JsonProperty('text')]
    public string $text;

    /**
     * @param array{
     *   text: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->text = $values['text'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
