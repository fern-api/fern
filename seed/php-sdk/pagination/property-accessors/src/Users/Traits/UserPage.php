<?php

namespace Seed\Users\Traits;

use Seed\Users\Types\UserListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property UserListContainer $data
 * @property ?string $next
 */
trait UserPage 
{
    /**
     * @var UserListContainer $data
     */
    #[JsonProperty('data')]
    private UserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @return UserListContainer
     */
    public function getData(): UserListContainer {
        return $this->data;}

    /**
     * @param UserListContainer $value
     */
    public function setData(UserListContainer $value): self {
        $this->data = $value;return $this;}

    /**
     * @return ?string
     */
    public function getNext(): ?string {
        return $this->next;}

    /**
     * @param ?string $value
     */
    public function setNext(?string $value = null): self {
        $this->next = $value;return $this;}
}
