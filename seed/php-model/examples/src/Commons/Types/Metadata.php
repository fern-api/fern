<?php

namespace Seed\Commons\Types;

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

    #[JsonProperty("jsonString")]
    /**
     * @var ?string $jsonString
     */
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
