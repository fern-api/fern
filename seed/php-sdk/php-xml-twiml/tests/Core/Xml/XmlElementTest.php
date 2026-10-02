<?php

namespace Seed\Tests\Core\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlText;
use Seed\Core\Xml\XmlUtils;

class XmlElementTest extends TestCase
{
    public function testSerializesAttributesTextAndChildren(): void
    {
        $element = new XmlElement('Response', children: [
            new XmlElement('Say', 'Hello & <world>', ['voice' => 'man', 'loop' => 2, 'skip' => null]),
            new XmlElement('Hangup'),
        ]);

        $this->assertSame(
            '<Response><Say voice="man" loop="2">Hello &amp; &lt;world&gt;</Say><Hangup/></Response>',
            $element->toXml(),
        );
        $this->assertStringStartsWith('<?xml version="1.0" encoding="UTF-8"?>', $element->toXml(xmlDeclaration: true));
    }

    public function testSerializesNamespacesAndPrefixes(): void
    {
        $element = new XmlElement('Dial', '+15551234567', namespace: 'https://www.twilio.com/twiml', prefix: 'tw');
        $this->assertSame(
            '<tw:Dial xmlns:tw="https://www.twilio.com/twiml">+15551234567</tw:Dial>',
            $element->toXml(),
        );

        $withLang = new XmlElement('Say', 'bonjour', ['xml:lang' => 'fr-FR']);
        $this->assertSame('<Say xml:lang="fr-FR">bonjour</Say>', $withLang->toXml());
    }

    public function testRoundTrips(): void
    {
        $xml = '<Response><tw:Dial xmlns:tw="https://www.twilio.com/twiml" record="true">+1555</tw:Dial><Say xml:lang="fr-FR">bonjour</Say><Custom a="1"><Nested/></Custom></Response>';
        $parsed = XmlElement::fromXml($xml);

        $this->assertSame('Response', $parsed->name);
        $this->assertCount(3, $parsed->children);
        $dial = $parsed->getChild('Dial');
        $this->assertNotNull($dial);
        $this->assertSame('https://www.twilio.com/twiml', $dial->namespace);
        $this->assertSame('tw', $dial->prefix);
        $this->assertSame('true', $dial->getAttribute('record'));
        $this->assertSame('+1555', $dial->text);
        $this->assertSame($xml, $parsed->toXml());
    }

    public function testParsesScalars(): void
    {
        $this->assertSame(42, XmlUtils::parseInt(' 42 '));
        $this->assertSame(1.5, XmlUtils::parseFloat('1.5'));
        $this->assertTrue(XmlUtils::parseBool('true'));
        $this->assertTrue(XmlUtils::parseBool('1'));
        $this->assertFalse(XmlUtils::parseBool('false'));
        $this->assertSame(['a', 'b'], XmlUtils::parseList('a  b', ' ', XmlUtils::parseString(...)));
        $this->assertNull(XmlUtils::parseList(null, ' ', XmlUtils::parseString(...)));
        $this->assertSame('1.0', XmlUtils::toXmlString(1.0));
        $this->assertSame('true', XmlUtils::toXmlString(true));
        $this->assertSame('a,b', XmlUtils::joinValues(['a', null, 'b'], ','));

        $this->expectException(InvalidArgumentException::class);
        XmlUtils::parseInt('abc');
    }

    public function testRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Malformed XML');
        XmlElement::fromXml('<Response><Say>oops</Response>');
    }

    public function testRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('DOCTYPE');
        XmlElement::fromXml('<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><Response>&xxe;</Response>');
    }

    public function testRequireName(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Expected <Response> element but found <Say>');
        XmlUtils::parseRoot('<Say/>', 'Response');
    }

    public function testAdditionalContentAndWrappers(): void
    {
        $parsed = XmlElement::fromXml('<Dial a="1" b="2"><Numbers x="y"><Number>1</Number><Extension>7</Extension></Numbers><Unknown/></Dial>');

        $this->assertSame(['b' => '2'], XmlUtils::additionalAttributes($parsed, ['a']));

        $additional = XmlUtils::additionalChildren($parsed, [], ['Numbers' => ['Number']]);
        $this->assertCount(2, $additional);
        $rest = $additional[0]->toXmlElement();
        $this->assertSame('Numbers', $rest->name);
        $this->assertSame(['x' => 'y'], $rest->attributes);
        $this->assertCount(1, $rest->children);
        $this->assertSame('Unknown', $additional[1]->toXmlElement()->name);

        $rebuilt = new XmlElement('Dial', attributes: ['a' => '1']);
        XmlUtils::addWrapper($rebuilt, 'Numbers')->addChild(new XmlElement('Number', '1'));
        XmlUtils::addAdditional($rebuilt, ['b' => '2'], $additional, ['Numbers']);
        $this->assertSame(
            '<Dial a="1" b="2"><Numbers x="y"><Number>1</Number><Extension>7</Extension></Numbers><Unknown/></Dial>',
            $rebuilt->toXml(),
        );
    }

    public function testMixedContentOrder(): void
    {
        $say = (new XmlElement('Say', 'Hi '))->addChild(new XmlElement('break', attributes: ['strength' => 'weak']))->addText(' world');
        $this->assertSame('<Say>Hi <break strength="weak"/> world</Say>', $say->toXml());

        $parsed = XmlElement::fromXml("<Response>\n  <Say>Hi <break/> world</Say>\n  <Gather>Press a key, then <Say>one</Say></Gather>\n</Response>");
        $this->assertCount(2, $parsed->children);
        $this->assertSame(
            '<Response><Say>Hi <break/> world</Say><Gather>Press a key, then <Say>one</Say></Gather></Response>',
            $parsed->toXml(),
        );
    }

    public function testAddContentFollowsContentOrder(): void
    {
        $a = new XmlElement('Say', 'a');
        $b = new XmlElement('Say', 'b');
        $custom = new XmlElement('Custom');
        $late = new XmlElement('Say', 'c');
        $element = new XmlElement('Response');
        XmlUtils::addContent($element, [$a, $custom, $b, new XmlText('x')], [$a, $b, $late], [], [$custom]);
        $this->assertSame('<Response><Say>a</Say><Custom/><Say>b</Say>x<Say>c</Say></Response>', $element->toXml());
    }

    public function testAddContentPlacesWrapper(): void
    {
        $parsed = XmlElement::fromXml('<Dial><Numbers><Number>1</Number></Numbers><Unknown/></Dial>');
        $additional = XmlUtils::additionalChildren($parsed, [], ['Numbers' => ['Number']]);
        $number = new XmlElement('Number', '1');
        $content = XmlUtils::content($parsed, [], $additional, ['Numbers']);
        $this->assertCount(2, $content);

        $rebuilt = new XmlElement('Dial');
        XmlUtils::addContent($rebuilt, $content, [], ['Numbers' => [$number]], $additional);
        $this->assertSame('<Dial><Numbers><Number>1</Number></Numbers><Unknown/></Dial>', $rebuilt->toXml());
    }

    public function testAddContentPlacesWrapperAtFirstItem(): void
    {
        $number = new XmlElement('Number', '1');
        $custom = new XmlElement('Custom');
        $element = new XmlElement('Dial');
        XmlUtils::addContent($element, [$number, $custom], [], ['Numbers' => [$number]], [$custom]);
        $this->assertSame('<Dial><Numbers><Number>1</Number></Numbers><Custom/></Dial>', $element->toXml());
    }

    public function testContentMatchesTypedChildrenInDocumentOrder(): void
    {
        $parsed = XmlElement::fromXml('<Response><Say>a</Say><Custom/><Say>b</Say>tail</Response>');
        $additional = XmlUtils::additionalChildren($parsed, ['Say']);
        $content = XmlUtils::content($parsed, [[['Say'], [new XmlElement('Say', 'A'), new XmlElement('Say', 'B')]]], $additional);
        $this->assertCount(4, $content);
        $this->assertInstanceOf(XmlElement::class, $content[0]);
        $this->assertSame('A', $content[0]->text);
        $this->assertSame($additional[0], $content[1]);
        $this->assertInstanceOf(XmlElement::class, $content[2]);
        $this->assertSame('B', $content[2]->text);
        $this->assertInstanceOf(XmlText::class, $content[3]);
        $this->assertSame('tail', $content[3]->text);
    }
}
