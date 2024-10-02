<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ObjectWithMapOfMap extends SerializableType
{
    /**
     * @var array<string, array<string, string>> $map
     */
    #[JsonProperty('map'), ArrayType(['string' => ['string' => 'string']])]
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
