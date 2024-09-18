<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class BaseResource extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var array<mixed> $relatedResources
     */
    #[JsonProperty("related_resources"), ArrayType(["mixed"])]
    public array $relatedResources;

    /**
     * @var Memo $memo
     */
    #[JsonProperty("memo")]
    public Memo $memo;

    /**
     * @param string $id
     * @param array<mixed> $relatedResources
     * @param Memo $memo
     */
    public function __construct(
        string $id,
        array $relatedResources,
        Memo $memo,
    ) {
        $this->id = $id;
        $this->relatedResources = $relatedResources;
        $this->memo = $memo;
    }
}
