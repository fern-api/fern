<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $docs
 */
trait Docs 
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    private string $docs;

    /**
     * @return string
     */
    public function getDocs(): string {
        return $this->docs;}

    /**
     * @param string $value
     */
    public function setDocs(string $value): self {
        $this->docs = $value;return $this;}
}
