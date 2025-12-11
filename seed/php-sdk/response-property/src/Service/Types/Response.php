<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WithMetadata;
use Seed\Service\Traits\WithDocs;
use Seed\Core\Json\JsonProperty;

class Response extends JsonSerializableType
{
    use WithMetadata,WithDocs;

    /**
     * @var Movie $data
     */
    #[JsonProperty('data')]
    public Movie $data;

    /**
     * @param array{
     *   metadata: array<string, string>,
     *   docs: string,
     *   data: Movie,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->metadata = $values['metadata'];$this->docs = $values['docs'];$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
