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
    private array $conversations;

    /**
     * @var ?CursorPages $pages
     */
    #[JsonProperty('pages')]
    private ?CursorPages $pages;

    /**
     * @var int $totalCount
     */
    #[JsonProperty('total_count')]
    private int $totalCount;

    /**
     * @var 'conversation.list' $type
     */
    #[JsonProperty('type')]
    private string $type;

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
     * @return array<Conversation>
     */
    public function getConversations(): array {
        return $this->conversations;}

    /**
     * @param array<Conversation> $value
     */
    public function setConversations(array $value): self {
        $this->conversations = $value;return $this;}

    /**
     * @return ?CursorPages
     */
    public function getPages(): ?CursorPages {
        return $this->pages;}

    /**
     * @param ?CursorPages $value
     */
    public function setPages(?CursorPages $value = null): self {
        $this->pages = $value;return $this;}

    /**
     * @return int
     */
    public function getTotalCount(): int {
        return $this->totalCount;}

    /**
     * @param int $value
     */
    public function setTotalCount(int $value): self {
        $this->totalCount = $value;return $this;}

    /**
     * @return 'conversation.list'
     */
    public function getType(): string {
        return $this->type;}

    /**
     * @param 'conversation.list' $value
     */
    public function setType(string $value): self {
        $this->type = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
