<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $docs
 */
trait WithDocs
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    public string $docs;
}
