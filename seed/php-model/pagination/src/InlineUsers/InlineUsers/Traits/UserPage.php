<?php

namespace Seed\InlineUsers\InlineUsers\Traits;

use Seed\InlineUsers\InlineUsers\UserListContainer;
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
    public UserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;
}
