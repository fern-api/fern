<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WithMetadata;
use Seed\Service\Traits\WithDocs;
use Seed\Core\Json\JsonProperty;

class Response extends JsonSerializableType
{
    use WithMetadata;
    use WithDocs;

    /**
     * @var Movie $data
     */
    #[JsonProperty('data')]
    public Movie $data;

    /**
     * @param array{
     *   data: Movie,
     *   metadata: array<string, string>,
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->metadata = $values['metadata'];
        $this->docs = $values['docs'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
