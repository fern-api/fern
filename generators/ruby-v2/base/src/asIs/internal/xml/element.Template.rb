# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Xml
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
        # @return [String, nil] text content
        attr_accessor :text
        # @return [Array<Element, Serializable>] child elements, in document order
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

        # Appends a child element (an {Element} or any model responding to `to_xml_element`).
        #
        # @param child [Element, Serializable]
        # @return [self]
        def add_child(child)
          @children << child
          self
        end

        # @param name [String]
        # @return [Element, nil] the first child element with the given local name
        def child(name)
          @children.each do |child|
            element = child.to_xml_element
            return element if element.name == name
          end
          nil
        end

        # @param name [String]
        # @return [Array<Element>] child elements with the given local name
        def children_named(name)
          @children.map(&:to_xml_element).select { |element| element.name == name }
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
            children.map(&:to_xml_element) == other.children.map(&:to_xml_element)
        end
        alias eql? ==

        # @return [Integer]
        def hash
          [name, namespace, attributes, text, children.map(&:to_xml_element)].hash
        end

        # @return [String]
        def inspect
          "#<#{self.class.name} #{to_xml}>"
        end
      end
    end
  end
end
