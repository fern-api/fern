<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ObjectWithMapOfMap extends SerializableType
{
    #[JsonProperty("map"), ArrayType(["string" => ["string" => "string"]])]
    /**
     * @var array<string, array<string, string>> $map
     */
    public array $map;

    /**
     * @param array<string, array<string, string>> $map
     */
    public function __construct(
        array $map,
    ) {
        $this->map = $map;
    }
}
