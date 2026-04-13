<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class OrganizationsSearchOrganizationsRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    private string $tenantId;

    /**
     * @var string $organizationId
     */
    private string $organizationId;

    /**
     * @var ?int $limit
     */
    private ?int $limit;

    /**
     * @param array{
     *   tenantId: string,
     *   organizationId: string,
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->organizationId = $values['organizationId'];
        $this->limit = $values['limit'] ?? null;
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
     * @return string
     */
    public function getOrganizationId(): string
    {
        return $this->organizationId;
    }

    /**
     * @param string $value
     */
    public function setOrganizationId(string $value): self
    {
        $this->organizationId = $value;
        $this->_setField('organizationId');
        return $this;
    }

    /**
     * @return ?int
     */
    public function getLimit(): ?int
    {
        return $this->limit;
    }

    /**
     * @param ?int $value
     */
    public function setLimit(?int $value = null): self
    {
        $this->limit = $value;
        $this->_setField('limit');
        return $this;
    }
}
