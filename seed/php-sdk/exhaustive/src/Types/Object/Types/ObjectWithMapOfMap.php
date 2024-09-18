<?php

namespace Seed\Types\Object\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ObjectWithMapOfMap extends SerializableType
{
    /**
     * @var array<string, array<string, string>> $map
     */
    #[JsonProperty("map"), ArrayType(["string" => ["string" => "string"]])]
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
