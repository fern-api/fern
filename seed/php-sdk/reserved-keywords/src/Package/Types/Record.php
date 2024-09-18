<?php

namespace Seed\Package\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Record extends SerializableType
{
    /**
     * @var array<string, string> $foo
     */
    #[JsonProperty("foo"), ArrayType(["string" => "string"])]
    public array $foo;

    /**
     * @var int $_3D
     */
    #[JsonProperty("3d")]
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
