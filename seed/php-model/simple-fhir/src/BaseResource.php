<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Memo;

class BaseResource extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("related_resources"), ArrayType(["mixed"])]
    /**
     * @var array<mixed> $relatedResources
     */
    public array $relatedResources;

    #[JsonProperty("memo")]
    /**
     * @var Memo $memo
     */
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
