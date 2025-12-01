<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    private string $next;

    /**
     * @var Users $data
     */
    #[JsonProperty('data')]
    private Users $data;

    /**
     * @param array{
     *   next: string,
     *   data: Users,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->next = $values['next'];$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function getNext(): string {
        return $this->next;}

    /**
     * @param string $value
     */
    public function setNext(string $value): self {
        $this->next = $value;return $this;}

    /**
     * @return Users
     */
    public function getData(): Users {
        return $this->data;}

    /**
     * @param Users $value
     */
    public function setData(Users $value): self {
        $this->data = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
