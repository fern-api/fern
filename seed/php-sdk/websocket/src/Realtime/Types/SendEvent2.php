<?php

namespace Seed\Realtime\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendEvent2 extends JsonSerializableType
{
    /**
     * @var string $sendText2
     */
    #[JsonProperty('sendText2')]
    public string $sendText2;

    /**
     * @var bool $sendParam2
     */
    #[JsonProperty('sendParam2')]
    public bool $sendParam2;

    /**
     * @param array{
     *   sendText2: string,
     *   sendParam2: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->sendText2 = $values['sendText2'];$this->sendParam2 = $values['sendParam2'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
