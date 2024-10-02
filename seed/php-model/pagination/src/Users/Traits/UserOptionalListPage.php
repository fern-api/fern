<?php

namespace Seed\Users\Traits;

use Seed\Users\UserOptionalListContainer;
use Seed\Core\Json\JsonProperty;

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
