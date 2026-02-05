<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;

class JustFileWithOptionalQueryParamsRequest extends JsonSerializableType
{
    /**
     * @var ?string $maybeString
     */
    public ?string $maybeString;

    /**
     * @var ?int $maybeInteger
     */
    public ?int $maybeInteger;

    /**
     * @var File $file
     */
    public File $file;

    /**
     * @param array{
     *   file: File,
     *   maybeString?: ?string,
     *   maybeInteger?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->maybeString = $values['maybeString'] ?? null;
        $this->maybeInteger = $values['maybeInteger'] ?? null;
        $this->file = $values['file'];
    }
}
