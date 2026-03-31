<?php

namespace Seed\Completions;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CompletionEvent extends JsonSerializableType
{
    /**
     * @var string $content
     */
    #[JsonProperty('content')]
    public string $content;

    /**
     * @param array{
     *   content: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->content = $values['content'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
