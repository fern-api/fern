<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ResourceList extends JsonSerializableType
{
    /**
     * @var (
     *    'Account'
     *   |'Patient'
     *   |'Practitioner'
     *   |'Script'
     *   |'_unknown'
     * ) $resourceType
     */
    public readonly string $resourceType;

    /**
     * @var (
     *    Account
     *   |Patient
     *   |Practitioner
     *   |Script
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   resourceType: (
     *    'Account'
     *   |'Patient'
     *   |'Practitioner'
     *   |'Script'
     *   |'_unknown'
     * ),
     *   value: (
     *    Account
     *   |Patient
     *   |Practitioner
     *   |Script
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->resourceType = $values['resourceType'];
        $this->value = $values['value'];
    }

    /**
     * @param Account $account
     * @return ResourceList
     */
    public static function account(Account $account): ResourceList
    {
        return new ResourceList([
            'resourceType' => 'Account',
            'value' => $account,
        ]);
    }

    /**
     * @param Patient $patient
     * @return ResourceList
     */
    public static function patient(Patient $patient): ResourceList
    {
        return new ResourceList([
            'resourceType' => 'Patient',
            'value' => $patient,
        ]);
    }

    /**
     * @param Practitioner $practitioner
     * @return ResourceList
     */
    public static function practitioner(Practitioner $practitioner): ResourceList
    {
        return new ResourceList([
            'resourceType' => 'Practitioner',
            'value' => $practitioner,
        ]);
    }

    /**
     * @param Script $script
     * @return ResourceList
     */
    public static function script(Script $script): ResourceList
    {
        return new ResourceList([
            'resourceType' => 'Script',
            'value' => $script,
        ]);
    }

    /**
     * @return bool
     */
    public function isAccount(): bool
    {
        return $this->value instanceof Account && $this->resourceType === 'Account';
    }

    /**
     * @return Account
     */
    public function asAccount(): Account
    {
        if (!($this->value instanceof Account && $this->resourceType === 'Account')) {
            throw new Exception(
                "Expected Account; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPatient(): bool
    {
        return $this->value instanceof Patient && $this->resourceType === 'Patient';
    }

    /**
     * @return Patient
     */
    public function asPatient(): Patient
    {
        if (!($this->value instanceof Patient && $this->resourceType === 'Patient')) {
            throw new Exception(
                "Expected Patient; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPractitioner(): bool
    {
        return $this->value instanceof Practitioner && $this->resourceType === 'Practitioner';
    }

    /**
     * @return Practitioner
     */
    public function asPractitioner(): Practitioner
    {
        if (!($this->value instanceof Practitioner && $this->resourceType === 'Practitioner')) {
            throw new Exception(
                "Expected Practitioner; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isScript(): bool
    {
        return $this->value instanceof Script && $this->resourceType === 'Script';
    }

    /**
     * @return Script
     */
    public function asScript(): Script
    {
        if (!($this->value instanceof Script && $this->resourceType === 'Script')) {
            throw new Exception(
                "Expected Script; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['resource_type'] = $this->resourceType;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->resourceType) {
            case 'Account':
                $value = $this->asAccount()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'Patient':
                $value = $this->asPatient()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'Practitioner':
                $value = $this->asPractitioner()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'Script':
                $value = $this->asScript()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('resource_type', $data)) {
            throw new Exception(
                "JSON data is missing property 'resource_type'",
            );
        }
        $resourceType = $data['resource_type'];
        if (!(is_string($resourceType))) {
            throw new Exception(
                "Expected property 'resourceType' in JSON data to be string, instead received " . get_debug_type($data['resource_type']),
            );
        }

        $args['resourceType'] = $resourceType;
        switch ($resourceType) {
            case 'Account':
                $args['value'] = Account::jsonDeserialize($data);
                break;
            case 'Patient':
                $args['value'] = Patient::jsonDeserialize($data);
                break;
            case 'Practitioner':
                $args['value'] = Practitioner::jsonDeserialize($data);
                break;
            case 'Script':
                $args['value'] = Script::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['resourceType'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
