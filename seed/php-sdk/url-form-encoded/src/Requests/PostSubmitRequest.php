<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PostSubmitRequest extends JsonSerializableType
{
    /**
     * @var string $username The user's username
     */
    #[JsonProperty('username')]
    public string $username;

    /**
     * @var string $email The user's email address
     */
    #[JsonProperty('email')]
    public string $email;

    /**
     * @var string $content A JSON document carried as a form field
     */
    #[JsonProperty('Content')]
    public string $content;

    /**
     * @param array{
     *   username: string,
     *   email: string,
     *   content: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->username = $values['username'];
        $this->email = $values['email'];
        $this->content = $values['content'];
    }
}
