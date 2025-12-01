<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ReceiveSnakeCase extends JsonSerializableType
{
    /**
     * @var string $receiveText
     */
    #[JsonProperty('receive_text')]
    public string $receiveText;

    /**
     * @var int $receiveInt
     */
    #[JsonProperty('receive_int')]
    public int $receiveInt;

    /**
     * @param array{
     *   receiveText: string,
     *   receiveInt: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->receiveText = $values['receiveText'];$this->receiveInt = $values['receiveInt'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
