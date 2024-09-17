<?php

namespace Seed\Package;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Record extends SerializableType
{
    #[JsonProperty("foo"), ArrayType(["string" => "string"])]
    /**
     * @var array<string, string> $foo
     */
    public array $foo;

    #[JsonProperty("3d")]
    /**
     * @var int $_3D
     */
    public int $_3D;

    /**
     * @param array<string, string> $foo
     * @param int $_3D
     */
    public function __construct(
        array $foo,
        int $_3D,
    ) {
        $this->foo = $foo;
        $this->_3D = $_3D;
    }
}
