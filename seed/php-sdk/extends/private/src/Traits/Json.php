<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $raw
 */
trait Json 
{
    use Docs;

    /**
     * @var string $raw
     */
    #[JsonProperty('raw')]
    private string $raw;

    /**
     * @return string
     */
    public function getRaw(): string {
        return $this->raw;}

    /**
     * @param string $value
     */
    public function setRaw(string $value): self {
        $this->raw = $value;return $this;}
}
