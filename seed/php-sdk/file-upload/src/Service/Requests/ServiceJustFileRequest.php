<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;

class ServiceJustFileRequest extends JsonSerializableType
{
    /**
     * @var ?File $file
     */
    public ?File $file;

    /**
     * @param array{
     *   file?: ?File,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->file = $values['file'] ?? null;
    }
}
