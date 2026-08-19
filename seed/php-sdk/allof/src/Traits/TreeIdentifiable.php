<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $id
 */
trait TreeIdentifiable
{
    /**
     * @var string $id Unique tree identifier.
     */
    #[JsonProperty('id')]
    public string $id;
}
