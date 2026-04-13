<?php

namespace Seed\Common\Traits;

use Seed\Common\ChildType;
use Seed\Core\Json\JsonProperty;

/**
 * @property ?ChildType $childRef
 */
trait BaseType
{
    /**
     * @var ?ChildType $childRef
     */
    #[JsonProperty('child_ref')]
    public ?ChildType $childRef;
}
