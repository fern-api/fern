<?php

namespace Seed\Core;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class JsonProperty
{
    public function __construct(public string $name)
    {
    }
}
