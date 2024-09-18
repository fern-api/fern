<?php

namespace Seed\Commons\Metadata\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Metadata extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("data"), ArrayType(["string" => "string"])]
    /**
     * @var ?array<string, string> $data
     */
    public ?array $data;

    /**
     * @param string $id
     * @param ?array<string, string> $data
     */
    public function __construct(
        string $id,
        ?array $data = null,
    ) {
        $this->id = $id;
        $this->data = $data;
    }
}
