<?php

namespace Seed\Completions\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamCompletionRequest extends JsonSerializableType
{
    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @param array{
     *   query: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->query = $values['query'];
    }
}
