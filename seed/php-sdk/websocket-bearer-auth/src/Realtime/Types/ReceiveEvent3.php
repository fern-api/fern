<?php

namespace Seed\Realtime\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ReceiveEvent3 extends JsonSerializableType
{
    /**
     * @var string $receiveText3
     */
    #[JsonProperty('receiveText3')]
    public string $receiveText3;

    /**
     * @param array{
     *   receiveText3: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->receiveText3 = $values['receiveText3'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
