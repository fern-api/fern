<?php

namespace Seed\Query\Requests;

use Seed\Core\Json\JsonSerializableType;

class SendLiteralsInQueryRequest extends JsonSerializableType
{
    /**
     * @var string $prompt
     */
    public string $prompt;

    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var bool $stream
     */
    public bool $stream;

    /**
     * @param array{
     *   prompt: string,
     *   query: string,
     *   stream: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->prompt = $values['prompt'];
        $this->query = $values['query'];
        $this->stream = $values['stream'];
    }
}
