<?php

namespace Seed\Conversations;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OutboundCallConversationsResponse extends JsonSerializableType
{
    /**
     * @var mixed $conversationId Always null when dry_run is true.
     */
    #[JsonProperty('conversation_id')]
    public mixed $conversationId;

    /**
     * @var bool $dryRun Always true for this response.
     */
    #[JsonProperty('dry_run')]
    public bool $dryRun;

    /**
     * @param array{
     *   dryRun: bool,
     *   conversationId?: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->conversationId = $values['conversationId'] ?? null;
        $this->dryRun = $values['dryRun'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
