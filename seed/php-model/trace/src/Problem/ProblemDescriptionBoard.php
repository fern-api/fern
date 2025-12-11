<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\VariableValue;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ProblemDescriptionBoard extends JsonSerializableType
{
    /**
     * @var (
     *    'html'
     *   |'variable'
     *   |'testCaseId'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |VariableValue
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'html'
     *   |'variable'
     *   |'testCaseId'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
     *   |VariableValue
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param string $html
     * @return ProblemDescriptionBoard
     */
    public static function html(string $html): ProblemDescriptionBoard {
        return new ProblemDescriptionBoard([
            'type' => 'html',
            'value' => $html,
        ]);
    }

    /**
     * @param VariableValue $variable
     * @return ProblemDescriptionBoard
     */
    public static function variable(VariableValue $variable): ProblemDescriptionBoard {
        return new ProblemDescriptionBoard([
            'type' => 'variable',
            'value' => $variable,
        ]);
    }

    /**
     * @param string $testCaseId
     * @return ProblemDescriptionBoard
     */
    public static function testCaseId(string $testCaseId): ProblemDescriptionBoard {
        return new ProblemDescriptionBoard([
            'type' => 'testCaseId',
            'value' => $testCaseId,
        ]);
    }

    /**
     * @return bool
     */
    public function isHtml(): bool {
        return is_string($this->value)&& $this->type === 'html';
    }

    /**
     * @return string
     */
    public function asHtml(): string {
        if (!(is_string($this->value)&& $this->type === 'html')){
            throw new Exception(
                "Expected html; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isVariable(): bool {
        return $this->value instanceof VariableValue&& $this->type === 'variable';
    }

    /**
     * @return VariableValue
     */
    public function asVariable(): VariableValue {
        if (!($this->value instanceof VariableValue&& $this->type === 'variable')){
            throw new Exception(
                "Expected variable; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTestCaseId(): bool {
        return is_string($this->value)&& $this->type === 'testCaseId';
    }

    /**
     * @return string
     */
    public function asTestCaseId(): string {
        if (!(is_string($this->value)&& $this->type === 'testCaseId')){
            throw new Exception(
                "Expected testCaseId; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'html':
                $value = $this->value;
                $result['html'] = $value;
                break;
            case 'variable':
                $value = $this->asVariable()->jsonSerialize();
                $result['variable'] = $value;
                break;
            case 'testCaseId':
                $value = $this->value;
                $result['testCaseId'] = $value;
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'html':
                if (!array_key_exists('html', $data)){
                    throw new Exception(
                        "JSON data is missing property 'html'",
                    );
                }
                
                $args['value'] = $data['html'];
                break;
            case 'variable':
                if (!array_key_exists('variable', $data)){
                    throw new Exception(
                        "JSON data is missing property 'variable'",
                    );
                }
                
                if (!(is_array($data['variable']))){
                    throw new Exception(
                        "Expected property 'variable' in JSON data to be array, instead received " . get_debug_type($data['variable']),
                    );
                }
                $args['value'] = VariableValue::jsonDeserialize($data['variable']);
                break;
            case 'testCaseId':
                if (!array_key_exists('testCaseId', $data)){
                    throw new Exception(
                        "JSON data is missing property 'testCaseId'",
                    );
                }
                
                $args['value'] = $data['testCaseId'];
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
