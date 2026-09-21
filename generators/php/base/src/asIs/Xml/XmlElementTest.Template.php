<?php

namespace <%= namespace%>;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use <%= coreNamespace%>\Xml\XmlElement;
use <%= coreNamespace%>\Xml\XmlUtils;

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
}
