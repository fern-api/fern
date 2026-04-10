<?php

namespace Seed\FolderA\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetDirectThreadRequest extends JsonSerializableType
{
    /**
     * @var array<string> $ids
     */
    public array $ids;

    /**
     * @var array<string> $tags
     */
    public array $tags;

    /**
     * @param array{
     *   ids: array<string>,
     *   tags: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->ids = $values['ids'];
        $this->tags = $values['tags'];
    }
}
