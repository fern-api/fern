<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\User\Types\User;

class UpdateUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    private string $tenantId;

    /**
     * @var string $userId
     */
    private string $userId;

    /**
     * @var User $body
     */
    private User $body;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   body: User,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];$this->body = $values['body'];
    }

    /**
     * @return string
     */
    public function getTenantId(): string {
        return $this->tenantId;}

    /**
     * @param string $value
     */
    public function setTenantId(string $value): self {
        $this->tenantId = $value;return $this;}

    /**
     * @return string
     */
    public function getUserId(): string {
        return $this->userId;}

    /**
     * @param string $value
     */
    public function setUserId(string $value): self {
        $this->userId = $value;return $this;}

    /**
     * @return User
     */
    public function getBody(): User {
        return $this->body;}

    /**
     * @param User $value
     */
    public function setBody(User $value): self {
        $this->body = $value;return $this;}
}
