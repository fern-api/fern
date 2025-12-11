<?php

namespace Seed\InlineUsers\InlineUsers\Traits;

use Seed\InlineUsers\InlineUsers\UserOptionalListContainer;
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
    public UserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;
}
