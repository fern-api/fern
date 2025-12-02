<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ReceiveEvent2 extends JsonSerializableType
{
    /**
     * @var string $gamma
     */
    #[JsonProperty('gamma')]
    public string $gamma;

    /**
     * @var int $delta
     */
    #[JsonProperty('delta')]
    public int $delta;

    /**
     * @var bool $epsilon
     */
    #[JsonProperty('epsilon')]
    public bool $epsilon;

    /**
     * @param array{
     *   gamma: string,
     *   delta: int,
     *   epsilon: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->gamma = $values['gamma'];$this->delta = $values['delta'];$this->epsilon = $values['epsilon'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
