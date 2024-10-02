<?php

namespace Seed\Traits;

use Seed\Core\JsonProperty;

trait Docs
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    public string $docs;
}
