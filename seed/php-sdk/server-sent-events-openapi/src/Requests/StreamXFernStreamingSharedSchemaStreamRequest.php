<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamXFernStreamingSharedSchemaStreamRequest extends JsonSerializableType
{
    /**
     * @var string $prompt The prompt to complete.
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var string $model The model to use.
     */
    #[JsonProperty('model')]
    public string $model;

    /**
     * @var true $stream Whether to stream the response.
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @param array{
     *   prompt: string,
     *   model: string,
     *   stream: true,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->prompt = $values['prompt'];
        $this->model = $values['model'];
        $this->stream = $values['stream'];
    }
}
