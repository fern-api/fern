<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NullableStreamRequest extends JsonSerializableType
{
    /**
     * @var string $query The prompt or query to complete.
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var ?bool $stream Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
     */
    #[JsonProperty('stream')]
    public ?bool $stream;

    /**
     * @param array{
     *   query: string,
     *   stream?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->query = $values['query'];
        $this->stream = $values['stream'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
