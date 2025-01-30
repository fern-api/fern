<?php

namespace Seed\Complex\Types;

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
     * @var string $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   conversations: array<Conversation>,
     *   pages?: ?CursorPages,
     *   totalCount: int,
     *   type: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->conversations = $values['conversations'];
        $this->pages = $values['pages'] ?? null;
        $this->totalCount = $values['totalCount'];
        $this->type = $values['type'];
    }
}
