<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamXFernStreamingConditionRequest extends JsonSerializableType
{
    /**
     * @var string $query The prompt or query to complete.
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var false $stream Whether to stream the response.
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @param array{
     *   query: string,
     *   stream: false,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->query = $values['query'];
        $this->stream = $values['stream'];
    }
}
