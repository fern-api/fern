<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OutboundCallConversationsResponse extends JsonSerializableType
{
    /**
     * @var mixed $conversationId
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
     *   conversationId: mixed,
     *   dryRun: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->conversationId = $values['conversationId'];
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
