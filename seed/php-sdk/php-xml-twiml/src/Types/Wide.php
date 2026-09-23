<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

/**
 * Too many fields for a one-parameter-per-field constructor; exercises builder-based fromXml.
 */
class Wide extends XmlSerializableType
{
    /**
     * @var ?string $attr1
     */
    #[JsonProperty('attr1')]
    public ?string $attr1;

    /**
     * @var ?string $attr2
     */
    #[JsonProperty('attr2')]
    public ?string $attr2;

    /**
     * @var ?string $attr3
     */
    #[JsonProperty('attr3')]
    public ?string $attr3;

    /**
     * @var ?string $attr4
     */
    #[JsonProperty('attr4')]
    public ?string $attr4;

    /**
     * @var ?string $attr5
     */
    #[JsonProperty('attr5')]
    public ?string $attr5;

    /**
     * @var ?string $attr6
     */
    #[JsonProperty('attr6')]
    public ?string $attr6;

    /**
     * @var ?string $attr7
     */
    #[JsonProperty('attr7')]
    public ?string $attr7;

    /**
     * @var ?string $attr8
     */
    #[JsonProperty('attr8')]
    public ?string $attr8;

    /**
     * @var ?string $attr9
     */
    #[JsonProperty('attr9')]
    public ?string $attr9;

    /**
     * @var ?string $attr10
     */
    #[JsonProperty('attr10')]
    public ?string $attr10;

    /**
     * @var ?string $attr11
     */
    #[JsonProperty('attr11')]
    public ?string $attr11;

    /**
     * @var ?string $attr12
     */
    #[JsonProperty('attr12')]
    public ?string $attr12;

    /**
     * @var ?string $attr13
     */
    #[JsonProperty('attr13')]
    public ?string $attr13;

    /**
     * @var ?string $attr14
     */
    #[JsonProperty('attr14')]
    public ?string $attr14;

    /**
     * @var ?string $attr15
     */
    #[JsonProperty('attr15')]
    public ?string $attr15;

    /**
     * @var ?string $attr16
     */
    #[JsonProperty('attr16')]
    public ?string $attr16;

    /**
     * @var ?string $attr17
     */
    #[JsonProperty('attr17')]
    public ?string $attr17;

    /**
     * @var ?string $attr18
     */
    #[JsonProperty('attr18')]
    public ?string $attr18;

    /**
     * @var ?string $attr19
     */
    #[JsonProperty('attr19')]
    public ?string $attr19;

    /**
     * @var ?string $attr20
     */
    #[JsonProperty('attr20')]
    public ?string $attr20;

    /**
     * @var ?string $attr21
     */
    #[JsonProperty('attr21')]
    public ?string $attr21;

    /**
     * @var ?string $attr22
     */
    #[JsonProperty('attr22')]
    public ?string $attr22;

    /**
     * @var ?string $attr23
     */
    #[JsonProperty('attr23')]
    public ?string $attr23;

    /**
     * @var ?string $attr24
     */
    #[JsonProperty('attr24')]
    public ?string $attr24;

    /**
     * @var ?string $attr25
     */
    #[JsonProperty('attr25')]
    public ?string $attr25;

    /**
     * @var ?string $attr26
     */
    #[JsonProperty('attr26')]
    public ?string $attr26;

    /**
     * @var ?string $attr27
     */
    #[JsonProperty('attr27')]
    public ?string $attr27;

    /**
     * @var ?string $attr28
     */
    #[JsonProperty('attr28')]
    public ?string $attr28;

    /**
     * @var ?string $attr29
     */
    #[JsonProperty('attr29')]
    public ?string $attr29;

    /**
     * @var ?string $attr30
     */
    #[JsonProperty('attr30')]
    public ?string $attr30;

    /**
     * @var ?string $attr31
     */
    #[JsonProperty('attr31')]
    public ?string $attr31;

    /**
     * @var ?string $attr32
     */
    #[JsonProperty('attr32')]
    public ?string $attr32;

    /**
     * @var ?string $attr33
     */
    #[JsonProperty('attr33')]
    public ?string $attr33;

    /**
     * @var ?string $attr34
     */
    #[JsonProperty('attr34')]
    public ?string $attr34;

    /**
     * @var ?string $attr35
     */
    #[JsonProperty('attr35')]
    public ?string $attr35;

    /**
     * @var ?string $attr36
     */
    #[JsonProperty('attr36')]
    public ?string $attr36;

    /**
     * @var ?string $attr37
     */
    #[JsonProperty('attr37')]
    public ?string $attr37;

    /**
     * @var ?string $attr38
     */
    #[JsonProperty('attr38')]
    public ?string $attr38;

    /**
     * @var ?string $attr39
     */
    #[JsonProperty('attr39')]
    public ?string $attr39;

    /**
     * @var ?string $attr40
     */
    #[JsonProperty('attr40')]
    public ?string $attr40;

    /**
     * @var ?string $attr41
     */
    #[JsonProperty('attr41')]
    public ?string $attr41;

    /**
     * @var ?string $attr42
     */
    #[JsonProperty('attr42')]
    public ?string $attr42;

    /**
     * @var ?string $attr43
     */
    #[JsonProperty('attr43')]
    public ?string $attr43;

    /**
     * @var ?string $attr44
     */
    #[JsonProperty('attr44')]
    public ?string $attr44;

    /**
     * @var ?string $attr45
     */
    #[JsonProperty('attr45')]
    public ?string $attr45;

    /**
     * @var ?string $attr46
     */
    #[JsonProperty('attr46')]
    public ?string $attr46;

    /**
     * @var ?string $attr47
     */
    #[JsonProperty('attr47')]
    public ?string $attr47;

    /**
     * @var ?string $attr48
     */
    #[JsonProperty('attr48')]
    public ?string $attr48;

    /**
     * @var ?string $attr49
     */
    #[JsonProperty('attr49')]
    public ?string $attr49;

    /**
     * @var ?string $attr50
     */
    #[JsonProperty('attr50')]
    public ?string $attr50;

    /**
     * @var ?string $attr51
     */
    #[JsonProperty('attr51')]
    public ?string $attr51;

    /**
     * @var ?string $attr52
     */
    #[JsonProperty('attr52')]
    public ?string $attr52;

    /**
     * @var ?string $attr53
     */
    #[JsonProperty('attr53')]
    public ?string $attr53;

    /**
     * @var ?string $attr54
     */
    #[JsonProperty('attr54')]
    public ?string $attr54;

    /**
     * @var ?string $attr55
     */
    #[JsonProperty('attr55')]
    public ?string $attr55;

    /**
     * @var ?string $attr56
     */
    #[JsonProperty('attr56')]
    public ?string $attr56;

    /**
     * @var ?string $attr57
     */
    #[JsonProperty('attr57')]
    public ?string $attr57;

    /**
     * @var ?string $attr58
     */
    #[JsonProperty('attr58')]
    public ?string $attr58;

    /**
     * @var ?string $attr59
     */
    #[JsonProperty('attr59')]
    public ?string $attr59;

    /**
     * @var ?string $attr60
     */
    #[JsonProperty('attr60')]
    public ?string $attr60;

    /**
     * @var ?string $attr61
     */
    #[JsonProperty('attr61')]
    public ?string $attr61;

    /**
     * @var ?string $attr62
     */
    #[JsonProperty('attr62')]
    public ?string $attr62;

    /**
     * @var ?string $attr63
     */
    #[JsonProperty('attr63')]
    public ?string $attr63;

    /**
     * @var ?string $attr64
     */
    #[JsonProperty('attr64')]
    public ?string $attr64;

    /**
     * @var ?array<Pause> $children
     */
    #[JsonProperty('children'), ArrayType([Pause::class])]
    public ?array $children;

    /**
     * @param array{
     *   attr1?: ?string,
     *   attr2?: ?string,
     *   attr3?: ?string,
     *   attr4?: ?string,
     *   attr5?: ?string,
     *   attr6?: ?string,
     *   attr7?: ?string,
     *   attr8?: ?string,
     *   attr9?: ?string,
     *   attr10?: ?string,
     *   attr11?: ?string,
     *   attr12?: ?string,
     *   attr13?: ?string,
     *   attr14?: ?string,
     *   attr15?: ?string,
     *   attr16?: ?string,
     *   attr17?: ?string,
     *   attr18?: ?string,
     *   attr19?: ?string,
     *   attr20?: ?string,
     *   attr21?: ?string,
     *   attr22?: ?string,
     *   attr23?: ?string,
     *   attr24?: ?string,
     *   attr25?: ?string,
     *   attr26?: ?string,
     *   attr27?: ?string,
     *   attr28?: ?string,
     *   attr29?: ?string,
     *   attr30?: ?string,
     *   attr31?: ?string,
     *   attr32?: ?string,
     *   attr33?: ?string,
     *   attr34?: ?string,
     *   attr35?: ?string,
     *   attr36?: ?string,
     *   attr37?: ?string,
     *   attr38?: ?string,
     *   attr39?: ?string,
     *   attr40?: ?string,
     *   attr41?: ?string,
     *   attr42?: ?string,
     *   attr43?: ?string,
     *   attr44?: ?string,
     *   attr45?: ?string,
     *   attr46?: ?string,
     *   attr47?: ?string,
     *   attr48?: ?string,
     *   attr49?: ?string,
     *   attr50?: ?string,
     *   attr51?: ?string,
     *   attr52?: ?string,
     *   attr53?: ?string,
     *   attr54?: ?string,
     *   attr55?: ?string,
     *   attr56?: ?string,
     *   attr57?: ?string,
     *   attr58?: ?string,
     *   attr59?: ?string,
     *   attr60?: ?string,
     *   attr61?: ?string,
     *   attr62?: ?string,
     *   attr63?: ?string,
     *   attr64?: ?string,
     *   children?: ?array<Pause>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->attr1 = $values['attr1'] ?? null;
        $this->attr2 = $values['attr2'] ?? null;
        $this->attr3 = $values['attr3'] ?? null;
        $this->attr4 = $values['attr4'] ?? null;
        $this->attr5 = $values['attr5'] ?? null;
        $this->attr6 = $values['attr6'] ?? null;
        $this->attr7 = $values['attr7'] ?? null;
        $this->attr8 = $values['attr8'] ?? null;
        $this->attr9 = $values['attr9'] ?? null;
        $this->attr10 = $values['attr10'] ?? null;
        $this->attr11 = $values['attr11'] ?? null;
        $this->attr12 = $values['attr12'] ?? null;
        $this->attr13 = $values['attr13'] ?? null;
        $this->attr14 = $values['attr14'] ?? null;
        $this->attr15 = $values['attr15'] ?? null;
        $this->attr16 = $values['attr16'] ?? null;
        $this->attr17 = $values['attr17'] ?? null;
        $this->attr18 = $values['attr18'] ?? null;
        $this->attr19 = $values['attr19'] ?? null;
        $this->attr20 = $values['attr20'] ?? null;
        $this->attr21 = $values['attr21'] ?? null;
        $this->attr22 = $values['attr22'] ?? null;
        $this->attr23 = $values['attr23'] ?? null;
        $this->attr24 = $values['attr24'] ?? null;
        $this->attr25 = $values['attr25'] ?? null;
        $this->attr26 = $values['attr26'] ?? null;
        $this->attr27 = $values['attr27'] ?? null;
        $this->attr28 = $values['attr28'] ?? null;
        $this->attr29 = $values['attr29'] ?? null;
        $this->attr30 = $values['attr30'] ?? null;
        $this->attr31 = $values['attr31'] ?? null;
        $this->attr32 = $values['attr32'] ?? null;
        $this->attr33 = $values['attr33'] ?? null;
        $this->attr34 = $values['attr34'] ?? null;
        $this->attr35 = $values['attr35'] ?? null;
        $this->attr36 = $values['attr36'] ?? null;
        $this->attr37 = $values['attr37'] ?? null;
        $this->attr38 = $values['attr38'] ?? null;
        $this->attr39 = $values['attr39'] ?? null;
        $this->attr40 = $values['attr40'] ?? null;
        $this->attr41 = $values['attr41'] ?? null;
        $this->attr42 = $values['attr42'] ?? null;
        $this->attr43 = $values['attr43'] ?? null;
        $this->attr44 = $values['attr44'] ?? null;
        $this->attr45 = $values['attr45'] ?? null;
        $this->attr46 = $values['attr46'] ?? null;
        $this->attr47 = $values['attr47'] ?? null;
        $this->attr48 = $values['attr48'] ?? null;
        $this->attr49 = $values['attr49'] ?? null;
        $this->attr50 = $values['attr50'] ?? null;
        $this->attr51 = $values['attr51'] ?? null;
        $this->attr52 = $values['attr52'] ?? null;
        $this->attr53 = $values['attr53'] ?? null;
        $this->attr54 = $values['attr54'] ?? null;
        $this->attr55 = $values['attr55'] ?? null;
        $this->attr56 = $values['attr56'] ?? null;
        $this->attr57 = $values['attr57'] ?? null;
        $this->attr58 = $values['attr58'] ?? null;
        $this->attr59 = $values['attr59'] ?? null;
        $this->attr60 = $values['attr60'] ?? null;
        $this->attr61 = $values['attr61'] ?? null;
        $this->attr62 = $values['attr62'] ?? null;
        $this->attr63 = $values['attr63'] ?? null;
        $this->attr64 = $values['attr64'] ?? null;
        $this->children = $values['children'] ?? null;
    }

    /**
     * Renders this Wide as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Wide');
        $element->setAttribute('attr1', $this->attr1);
        $element->setAttribute('attr2', $this->attr2);
        $element->setAttribute('attr3', $this->attr3);
        $element->setAttribute('attr4', $this->attr4);
        $element->setAttribute('attr5', $this->attr5);
        $element->setAttribute('attr6', $this->attr6);
        $element->setAttribute('attr7', $this->attr7);
        $element->setAttribute('attr8', $this->attr8);
        $element->setAttribute('attr9', $this->attr9);
        $element->setAttribute('attr10', $this->attr10);
        $element->setAttribute('attr11', $this->attr11);
        $element->setAttribute('attr12', $this->attr12);
        $element->setAttribute('attr13', $this->attr13);
        $element->setAttribute('attr14', $this->attr14);
        $element->setAttribute('attr15', $this->attr15);
        $element->setAttribute('attr16', $this->attr16);
        $element->setAttribute('attr17', $this->attr17);
        $element->setAttribute('attr18', $this->attr18);
        $element->setAttribute('attr19', $this->attr19);
        $element->setAttribute('attr20', $this->attr20);
        $element->setAttribute('attr21', $this->attr21);
        $element->setAttribute('attr22', $this->attr22);
        $element->setAttribute('attr23', $this->attr23);
        $element->setAttribute('attr24', $this->attr24);
        $element->setAttribute('attr25', $this->attr25);
        $element->setAttribute('attr26', $this->attr26);
        $element->setAttribute('attr27', $this->attr27);
        $element->setAttribute('attr28', $this->attr28);
        $element->setAttribute('attr29', $this->attr29);
        $element->setAttribute('attr30', $this->attr30);
        $element->setAttribute('attr31', $this->attr31);
        $element->setAttribute('attr32', $this->attr32);
        $element->setAttribute('attr33', $this->attr33);
        $element->setAttribute('attr34', $this->attr34);
        $element->setAttribute('attr35', $this->attr35);
        $element->setAttribute('attr36', $this->attr36);
        $element->setAttribute('attr37', $this->attr37);
        $element->setAttribute('attr38', $this->attr38);
        $element->setAttribute('attr39', $this->attr39);
        $element->setAttribute('attr40', $this->attr40);
        $element->setAttribute('attr41', $this->attr41);
        $element->setAttribute('attr42', $this->attr42);
        $element->setAttribute('attr43', $this->attr43);
        $element->setAttribute('attr44', $this->attr44);
        $element->setAttribute('attr45', $this->attr45);
        $element->setAttribute('attr46', $this->attr46);
        $element->setAttribute('attr47', $this->attr47);
        $element->setAttribute('attr48', $this->attr48);
        $element->setAttribute('attr49', $this->attr49);
        $element->setAttribute('attr50', $this->attr50);
        $element->setAttribute('attr51', $this->attr51);
        $element->setAttribute('attr52', $this->attr52);
        $element->setAttribute('attr53', $this->attr53);
        $element->setAttribute('attr54', $this->attr54);
        $element->setAttribute('attr55', $this->attr55);
        $element->setAttribute('attr56', $this->attr56);
        $element->setAttribute('attr57', $this->attr57);
        $element->setAttribute('attr58', $this->attr58);
        $element->setAttribute('attr59', $this->attr59);
        $element->setAttribute('attr60', $this->attr60);
        $element->setAttribute('attr61', $this->attr61);
        $element->setAttribute('attr62', $this->attr62);
        $element->setAttribute('attr63', $this->attr63);
        $element->setAttribute('attr64', $this->attr64);
        foreach ($this->children ?? [] as $item) {
            $element->addChild($item);
        }
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Wide>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Wide'));
    }

    /**
     * Reads a Wide from an already-parsed <Wide> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Wide');
        $result = new self([
            'attr1' => $element->getAttribute('attr1'),
            'attr2' => $element->getAttribute('attr2'),
            'attr3' => $element->getAttribute('attr3'),
            'attr4' => $element->getAttribute('attr4'),
            'attr5' => $element->getAttribute('attr5'),
            'attr6' => $element->getAttribute('attr6'),
            'attr7' => $element->getAttribute('attr7'),
            'attr8' => $element->getAttribute('attr8'),
            'attr9' => $element->getAttribute('attr9'),
            'attr10' => $element->getAttribute('attr10'),
            'attr11' => $element->getAttribute('attr11'),
            'attr12' => $element->getAttribute('attr12'),
            'attr13' => $element->getAttribute('attr13'),
            'attr14' => $element->getAttribute('attr14'),
            'attr15' => $element->getAttribute('attr15'),
            'attr16' => $element->getAttribute('attr16'),
            'attr17' => $element->getAttribute('attr17'),
            'attr18' => $element->getAttribute('attr18'),
            'attr19' => $element->getAttribute('attr19'),
            'attr20' => $element->getAttribute('attr20'),
            'attr21' => $element->getAttribute('attr21'),
            'attr22' => $element->getAttribute('attr22'),
            'attr23' => $element->getAttribute('attr23'),
            'attr24' => $element->getAttribute('attr24'),
            'attr25' => $element->getAttribute('attr25'),
            'attr26' => $element->getAttribute('attr26'),
            'attr27' => $element->getAttribute('attr27'),
            'attr28' => $element->getAttribute('attr28'),
            'attr29' => $element->getAttribute('attr29'),
            'attr30' => $element->getAttribute('attr30'),
            'attr31' => $element->getAttribute('attr31'),
            'attr32' => $element->getAttribute('attr32'),
            'attr33' => $element->getAttribute('attr33'),
            'attr34' => $element->getAttribute('attr34'),
            'attr35' => $element->getAttribute('attr35'),
            'attr36' => $element->getAttribute('attr36'),
            'attr37' => $element->getAttribute('attr37'),
            'attr38' => $element->getAttribute('attr38'),
            'attr39' => $element->getAttribute('attr39'),
            'attr40' => $element->getAttribute('attr40'),
            'attr41' => $element->getAttribute('attr41'),
            'attr42' => $element->getAttribute('attr42'),
            'attr43' => $element->getAttribute('attr43'),
            'attr44' => $element->getAttribute('attr44'),
            'attr45' => $element->getAttribute('attr45'),
            'attr46' => $element->getAttribute('attr46'),
            'attr47' => $element->getAttribute('attr47'),
            'attr48' => $element->getAttribute('attr48'),
            'attr49' => $element->getAttribute('attr49'),
            'attr50' => $element->getAttribute('attr50'),
            'attr51' => $element->getAttribute('attr51'),
            'attr52' => $element->getAttribute('attr52'),
            'attr53' => $element->getAttribute('attr53'),
            'attr54' => $element->getAttribute('attr54'),
            'attr55' => $element->getAttribute('attr55'),
            'attr56' => $element->getAttribute('attr56'),
            'attr57' => $element->getAttribute('attr57'),
            'attr58' => $element->getAttribute('attr58'),
            'attr59' => $element->getAttribute('attr59'),
            'attr60' => $element->getAttribute('attr60'),
            'attr61' => $element->getAttribute('attr61'),
            'attr62' => $element->getAttribute('attr62'),
            'attr63' => $element->getAttribute('attr63'),
            'attr64' => $element->getAttribute('attr64'),
            'children' => XmlUtils::parseChildren($element, ['Pause' => Pause::fromXmlElement(...)]),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['attr1', 'attr2', 'attr3', 'attr4', 'attr5', 'attr6', 'attr7', 'attr8', 'attr9', 'attr10', 'attr11', 'attr12', 'attr13', 'attr14', 'attr15', 'attr16', 'attr17', 'attr18', 'attr19', 'attr20', 'attr21', 'attr22', 'attr23', 'attr24', 'attr25', 'attr26', 'attr27', 'attr28', 'attr29', 'attr30', 'attr31', 'attr32', 'attr33', 'attr34', 'attr35', 'attr36', 'attr37', 'attr38', 'attr39', 'attr40', 'attr41', 'attr42', 'attr43', 'attr44', 'attr45', 'attr46', 'attr47', 'attr48', 'attr49', 'attr50', 'attr51', 'attr52', 'attr53', 'attr54', 'attr55', 'attr56', 'attr57', 'attr58', 'attr59', 'attr60', 'attr61', 'attr62', 'attr63', 'attr64']));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, ['Pause']));
        return $result;
    }

    /**
     * Adds a <Pause> child element and returns it (for nesting further children).
     *
     * @param (
     *    Pause
     *   |array{
     *   length?: ?int,
     * }
     * ) $child The <Pause> to add, or the properties to construct it with.
     * @return Pause
     */
    public function pause(Pause|array $child = []): Pause
    {
        $childElement = $child instanceof Pause ? $child : new Pause($child);
        $this->children = [...($this->children ?? []), $childElement];
        return $childElement;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toXml(xmlDeclaration: true);
    }
}
