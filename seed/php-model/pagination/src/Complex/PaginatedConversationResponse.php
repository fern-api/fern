<?php

namespace Seed\Complex;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class PaginatedConversationResponse extends JsonSerializableType
{
    /**
     * @var array<Conversation> $conversations
     */
    #[JsonProperty('conversations'), ArrayType([Conversation::class])]
    public array $conversations;

    /**
     * @var ?CursorPages $pages
     */
    #[JsonProperty('pages')]
    public ?CursorPages $pages;

    /**
     * @var int $totalCount
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @var 'conversation.list' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   conversations: array<Conversation>,
     *   totalCount: int,
     *   type: 'conversation.list',
     *   pages?: ?CursorPages,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->conversations = $values['conversations'];$this->pages = $values['pages'] ?? null;$this->totalCount = $values['totalCount'];$this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
