<?php

namespace Seed\Types\Object;

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
     * @param array{
     *   map: array<string, array<string, string>>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->map = $values['map'];
    }
}
