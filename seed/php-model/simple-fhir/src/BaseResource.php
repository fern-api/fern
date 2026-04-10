<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class BaseResource extends JsonSerializableType
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

    /**
     * @param array{
     *   id: string,
     *   relatedResources: array<ResourceList>,
     *   memo: Memo,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->relatedResources = $values['relatedResources'];
        $this->memo = $values['memo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
