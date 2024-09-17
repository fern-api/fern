<?php

namespace Seed\Package\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;


class Record
 extends SerializableType {
    #[JsonProperty("foo"), ArrayType(["string" => "string"])]
    /**
     * @var array<string, string> $foo
     */
    public array $foo;

    #[JsonProperty("3d")]
    /**
     * @var int $3D
     */
    public int $3D;

    /**
     * @param array<string, string> $foo
     * @param int $3D
     */
    function __construct(
        array $foo,
        int $3D,
    )
    {
        $this->foo = $foo;
        $this->3D = $3D;
    }
}
