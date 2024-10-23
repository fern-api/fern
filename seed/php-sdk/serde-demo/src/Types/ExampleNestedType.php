<?php

namespace Seed\Types;

use Seed\Core\JsonProperty;
use Seed\Core\SerializableType;

class ExampleNestedType extends SerializableType
{
    public function __construct(
        #[JsonProperty('nested_field')]
        public string $nestedField
    )
    {
    }
}
