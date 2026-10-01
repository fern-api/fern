# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Xml
      # A text segment inside an element's content. Used alongside child elements to keep mixed
      # content (text interleaved with elements) in document order.
      class Text
        # @return [String]
        attr_accessor :value

        # @param value [String]
        def initialize(value)
          @value = value.to_s
        end

        # @return [String]
        def to_s
          @value
        end

        # @return [Boolean]
        def ==(other)
          other.is_a?(Text) && value == other.value
        end
        alias eql? ==

        # @return [Integer]
        def hash
          [Text, value].hash
        end

        # @return [String]
        def inspect
          "#<#{self.class.name} #{value.inspect}>"
        end
      end

      # A generic XML element tree. Used to carry unknown child elements through a
      # round trip and as the intermediate form typed models serialize to and parse from.
      class Element
        # @return [String] local name of the element (without prefix)
        attr_accessor :name
        # @return [String, nil] namespace URI of the element
        attr_accessor :namespace
        # @return [String, nil] namespace prefix of the element
        attr_accessor :prefix
        # @return [Hash<String, String>] attributes keyed by qualified name (excluding xmlns declarations)
        attr_reader :attributes
        # @return [String, nil] text content written before the children
        attr_accessor :text
        # @return [Array<Element, Serializable, Text>] child elements and text segments, in document order
        attr_reader :children
        # @return [Hash<String, String>] namespace declarations keyed by prefix ("" for the default namespace)
        attr_reader :namespace_declarations

        # @param name [String]
        # @param text [String, nil]
        # @param attributes [Hash<String, String>]
        # @param namespace [String, nil]
        # @param prefix [String, nil]
        def initialize(name, text: nil, attributes: {}, namespace: nil, prefix: nil)
          @name = name
          @text = text
          @attributes = attributes.transform_keys(&:to_s).transform_values(&:to_s)
          @namespace = namespace
          @prefix = prefix
          @children = []
          @namespace_declarations = {}
        end

        # @param name [String]
        # @param value [Object]
        # @return [self]
        def set_attribute(name, value)
          @attributes[name.to_s] = value.to_s
          self
        end

        # @param name [String]
        # @return [String, nil]
        def attribute(name)
          @attributes[name.to_s]
        end

        # Appends a child element (an {Element} or any model responding to `to_xml_element`) or a
        # {Text} segment after the children added so far.
        #
        # @param child [Element, Serializable, Text]
        # @return [self]
        def add_child(child)
          @children << child
          self
        end

        # Appends a text segment after the children added so far (for mixed content).
        #
        # @param text [String]
        # @return [self]
        def add_text(text)
          @children << Text.new(text)
          self
        end

        # @return [Array<Element>] the child elements (text segments excluded), in document order
        def child_elements
          @children.grep_v(Text).map(&:to_xml_element)
        end

        # @param name [String]
        # @return [Element, nil] the first child element with the given local name
        def child(name)
          child_elements.find { |element| element.name == name }
        end

        # @param name [String]
        # @return [Array<Element>] child elements with the given local name
        def children_named(name)
          child_elements.select { |element| element.name == name }
        end

        # @return [self]
        def to_xml_element
          self
        end

        # @param xml_declaration [Boolean] whether to prepend `<?xml version="1.0" encoding="UTF-8"?>`
        # @return [String]
        def to_xml(xml_declaration: false)
          Utils.serialize(self, xml_declaration: xml_declaration)
        end

        # @return [String]
        def to_s
          to_xml
        end

        # @return [Boolean]
        def ==(other)
          other.is_a?(Element) &&
            name == other.name &&
            namespace == other.namespace &&
            attributes == other.attributes &&
            text == other.text &&
            comparable_children == other.comparable_children
        end
        alias eql? ==

        # @return [Integer]
        def hash
          [name, namespace, attributes, text, comparable_children].hash
        end

        # @api private
        def comparable_children
          children.map { |child| child.is_a?(Text) ? child : child.to_xml_element }
        end

        # @return [String]
        def inspect
          "#<#{self.class.name} #{to_xml}>"
        end
      end
    end
  end
end
