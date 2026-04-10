<?php

namespace Seed\Traits;

use Seed\ResourceList;
use Seed\Memo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $id
 * @property array<ResourceList> $relatedResources
 * @property Memo $memo
 */
trait BaseResource
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var array<ResourceList> $relatedResources
     */
    #[JsonProperty('related_resources'), ArrayType([ResourceList::class])]
    public array $relatedResources;

    /**
     * @var Memo $memo
     */
    #[JsonProperty('memo')]
    public Memo $memo;
}
