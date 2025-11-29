<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class SearchUsersRequest extends JsonSerializableType
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
     * @var ?int $limit
     */
    private ?int $limit;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];$this->limit = $values['limit'] ?? null;
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
     * @return ?int
     */
    public function getLimit(): ?int {
        return $this->limit;}

    /**
     * @param ?int $value
     */
    public function setLimit(?int $value = null): self {
        $this->limit = $value;return $this;}
}
