<?php

namespace Seed\Service\Traits;

use Seed\Core\Json\JsonProperty;

trait WithDocs
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    public string $docs;
}
