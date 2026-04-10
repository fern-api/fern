<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $content
 */
trait CompletionEvent
{
    /**
     * @var string $content
     */
    #[JsonProperty('content')]
    public string $content;
}
