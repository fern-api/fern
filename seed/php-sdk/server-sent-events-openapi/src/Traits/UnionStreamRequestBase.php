<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * Base schema for union stream requests. Contains the stream_response field that is inherited by all oneOf variants via allOf. This schema is also referenced directly by a non-streaming endpoint to ensure it is not excluded from the context.
 *
 * @property ?bool $streamResponse
 * @property string $prompt
 */
trait UnionStreamRequestBase
{
    /**
     * @var ?bool $streamResponse Whether to stream the response.
     */
    #[JsonProperty('stream_response')]
    public ?bool $streamResponse;

    /**
     * @var string $prompt The input prompt.
     */
    #[JsonProperty('prompt')]
    public string $prompt;
}
