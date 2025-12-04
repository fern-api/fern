<?php

namespace Seed\Types\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $name
 */
trait Foo 
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @return string
     */
    public function getName(): string {
        return $this->name;}

    /**
     * @param string $value
     */
    public function setName(string $value): self {
        $this->name = $value;return $this;}
}
