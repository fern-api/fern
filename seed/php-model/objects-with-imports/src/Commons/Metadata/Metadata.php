<?php

namespace Seed\Commons\Metadata;

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
     * @param array{
     *   id: string,
     *   data?: ?array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->data = $values['data'] ?? null;
    }
}
