<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendEvent extends JsonSerializableType
{
    /**
     * @var string $sendText
     */
    #[JsonProperty('sendText')]
    public string $sendText;

    /**
     * @var int $sendParam
     */
    #[JsonProperty('sendParam')]
    public int $sendParam;

    /**
     * @param array{
     *   sendText: string,
     *   sendParam: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->sendText = $values['sendText'];$this->sendParam = $values['sendParam'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
