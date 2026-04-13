<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\User;

class UserCreateUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    private string $tenantId;

    /**
     * @var User $body
     */
    private User $body;

    /**
     * @param array{
     *   tenantId: string,
     *   body: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->body = $values['body'];
    }

    /**
     * @return string
     */
    public function getTenantId(): string
    {
        return $this->tenantId;
    }

    /**
     * @param string $value
     */
    public function setTenantId(string $value): self
    {
        $this->tenantId = $value;
        $this->_setField('tenantId');
        return $this;
    }

    /**
     * @return User
     */
    public function getBody(): User
    {
        return $this->body;
    }

    /**
     * @param User $value
     */
    public function setBody(User $value): self
    {
        $this->body = $value;
        $this->_setField('body');
        return $this;
    }
}
