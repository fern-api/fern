<?php

namespace Seed\Users\Traits;

use Seed\Users\Types\UserOptionalListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property UserOptionalListContainer $data
 * @property ?string $next
 */
trait UserOptionalListPage 
{
    /**
     * @var UserOptionalListContainer $data
     */
    #[JsonProperty('data')]
    private UserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @return UserOptionalListContainer
     */
    public function getData(): UserOptionalListContainer {
        return $this->data;}

    /**
     * @param UserOptionalListContainer $value
     */
    public function setData(UserOptionalListContainer $value): self {
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
