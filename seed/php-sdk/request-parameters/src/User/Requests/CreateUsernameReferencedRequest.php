<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\User\Types\CreateUsernameBody;

class CreateUsernameReferencedRequest extends JsonSerializableType
{
    /**
     * @var array<string> $tags
     */
    public array $tags;

    /**
     * @var CreateUsernameBody $body
     */
    public CreateUsernameBody $body;

    /**
     * @param array{
     *   tags: array<string>,
     *   body: CreateUsernameBody,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tags = $values['tags'];$this->body = $values['body'];
    }
}
