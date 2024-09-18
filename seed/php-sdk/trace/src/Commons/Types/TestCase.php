<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TestCase extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("params"), ArrayType(["mixed"])]
    /**
     * @var array<mixed> $params
     */
    public array $params;

    /**
     * @param string $id
     * @param array<mixed> $params
     */
    public function __construct(
        string $id,
        array $params,
    ) {
        $this->id = $id;
        $this->params = $params;
    }
}
