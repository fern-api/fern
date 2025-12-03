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
    public string $docs;
}
