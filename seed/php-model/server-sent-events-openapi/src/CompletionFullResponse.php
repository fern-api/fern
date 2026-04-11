<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Full response returned when streaming is disabled.
 */
class CompletionFullResponse extends JsonSerializableType
{
    /**
     * @var ?string $answer The complete generated answer.
     */
    #[JsonProperty('answer')]
    public ?string $answer;

    /**
     * @var ?value-of<CompletionFullResponseFinishReason> $finishReason Why generation stopped.
     */
    #[JsonProperty('finishReason')]
    public ?string $finishReason;

    /**
     * @param array{
     *   answer?: ?string,
     *   finishReason?: ?value-of<CompletionFullResponseFinishReason>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->answer = $values['answer'] ?? null;
        $this->finishReason = $values['finishReason'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
