<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ReceiveEvent extends JsonSerializableType
{
    /**
     * @var string $alpha
     */
    #[JsonProperty('alpha')]
    public string $alpha;

    /**
     * @var int $beta
     */
    #[JsonProperty('beta')]
    public int $beta;

    /**
     * @param array{
     *   alpha: string,
     *   beta: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->alpha = $values['alpha'];$this->beta = $values['beta'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
