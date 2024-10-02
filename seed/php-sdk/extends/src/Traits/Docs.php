<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

trait Docs
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    public string $docs;
}
