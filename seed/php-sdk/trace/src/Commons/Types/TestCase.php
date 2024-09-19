<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TestCase extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var array<mixed> $params
     */
    #[JsonProperty("params"), ArrayType(["mixed"])]
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
