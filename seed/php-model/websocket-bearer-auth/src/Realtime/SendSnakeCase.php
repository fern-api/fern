<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendSnakeCase extends JsonSerializableType
{
    /**
     * @var string $sendText
     */
    #[JsonProperty('send_text')]
    public string $sendText;

    /**
     * @var int $sendParam
     */
    #[JsonProperty('send_param')]
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
