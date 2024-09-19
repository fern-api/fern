<?php

namespace Seed\Commons\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Metadata extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var ?array<string, string> $data
     */
    #[JsonProperty("data"), ArrayType(["string" => "string"])]
    public ?array $data;

    /**
     * @var ?string $jsonString
     */
    #[JsonProperty("jsonString")]
    public ?string $jsonString;

    /**
     * @param string $id
     * @param ?array<string, string> $data
     * @param ?string $jsonString
     */
    public function __construct(
        string $id,
        ?array $data = null,
        ?string $jsonString = null,
    ) {
        $this->id = $id;
        $this->data = $data;
        $this->jsonString = $jsonString;
    }
}
