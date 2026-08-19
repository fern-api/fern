<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamXFernStreamingNullableConditionStreamRequest extends JsonSerializableType
{
    /**
     * @var string $query The prompt or query to complete.
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var true $stream Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @param array{
     *   query: string,
     *   stream: true,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->query = $values['query'];
        $this->stream = $values['stream'];
    }
}
