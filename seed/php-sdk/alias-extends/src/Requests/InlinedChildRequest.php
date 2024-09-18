<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;

class InlinedChildRequest
{
    /**
     * @var string $child
     */
    #[JsonProperty("child")]
    public string $child;

    /**
     * @var string $parent
     */
    #[JsonProperty("parent")]
    public string $parent;

}
