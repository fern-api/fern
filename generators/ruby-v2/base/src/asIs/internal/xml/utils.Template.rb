# frozen_string_literal: true

require "rexml/document"

module <%= gem_namespace %>
  module Internal
    module Xml
      # Serialization, parsing and value-conversion helpers shared by all XML-encoded types.
      module Utils
        XML_DECLARATION = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        # Matches a DOCTYPE in the prolog (before the root element); only there can one legitimately appear.
        DOCTYPE_IN_PROLOG = /\A\s*(?:<\?.*?\?>\s*|<!--.*?-->\s*)*<!DOCTYPE/mi
        TRUE_VALUES = %w[true 1].freeze
        FALSE_VALUES = %w[false 0].freeze

        class << self
          # -----------------------------------------------------------------------------------------
          # Serialization
          # -----------------------------------------------------------------------------------------

          # @param element [Element]
          # @param xml_declaration [Boolean]
          # @return [String]
          def serialize(element, xml_declaration: false)
            output = +""
            output << XML_DECLARATION if xml_declaration
            write_element(output, element.to_xml_element, {})
            output
          end

          # Writes `element` and its subtree to `output`. `scope` maps the namespace prefixes in scope
          # ("" for the default namespace) to their URIs so declarations are only emitted where they change.
          private def write_element(output, element, scope)
            scope = scope.dup
            declarations = {}
            declare = ->(declared_prefix, uri) {
              next if scope[declared_prefix] == uri

              declarations[declared_prefix] = uri
              scope[declared_prefix] = uri
            }

            element.namespace_declarations.each { |declared_prefix, uri| declare.call(declared_prefix.to_s, uri) }
            attributes = {}
            element.attributes.each do |name, value|
              if name == "xmlns"
                declare.call("", value)
              elsif name.start_with?("xmlns:")
                declare.call(name.delete_prefix("xmlns:"), value)
              else
                attributes[name] = value
              end
            end

            prefix = element.prefix.to_s
            namespace = element.namespace
            namespace = scope[prefix] if namespace.nil? && !prefix.empty?
            # `namespace` semantics from here on: nil = inherit whatever is in scope, "" = explicitly no
            # namespace (emits `xmlns=""` to reset an inherited default namespace so an unqualified
            # element stays unqualified), otherwise a URI to declare if not already in scope.
            namespace = "" if namespace.nil? && prefix.empty? && !scope[""].to_s.empty?
            declare.call(prefix, namespace) unless namespace.nil? || (namespace.empty? && scope[""].to_s.empty?)

            attributes.each_key do |name|
              colon = name.index(":")
              next if colon.nil?

              attribute_prefix = name[0, colon]
              next if attribute_prefix == "xml" || scope.key?(attribute_prefix)

              uri = element.namespace_declarations[attribute_prefix]
              declare.call(attribute_prefix, uri) unless uri.nil?
            end

            qualified_name = prefix.empty? ? element.name : "#{prefix}:#{element.name}"
            output << "<" << qualified_name
            declarations.each do |declared_prefix, uri|
              attribute_name = declared_prefix.empty? ? "xmlns" : "xmlns:#{declared_prefix}"
              output << " " << attribute_name << "=\"" << escape_attribute(uri) << "\""
            end
            attributes.each do |name, value|
              output << " " << name << "=\"" << escape_attribute(value) << "\""
            end
            if element.text.nil? && element.children.empty?
              output << "/>"
              return
            end
            output << ">"
            output << escape_text(element.text) unless element.text.nil?
            element.children.each { |child| write_element(output, child.to_xml_element, scope) }
            output << "</" << qualified_name << ">"
          end

          # @param value [String]
          # @return [String]
          def escape_text(value)
            value.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
          end

          # @param value [String]
          # @return [String]
          def escape_attribute(value)
            escape_text(value).gsub("\"", "&quot;")
          end

          # Converts a Ruby value to its XML string form.
          #
          # @param value [Object]
          # @return [String, nil]
          def to_xml_string(value)
            case value
            when nil then nil
            when true then "true"
            when false then "false"
            else value.to_s
            end
          end

          # Joins a list of values with a separator for a list-valued attribute or text node.
          #
          # @param values [Enumerable, nil]
          # @param separator [String]
          # @return [String, nil]
          def join_values(values, separator)
            return nil if values.nil?

            values.map { |value| to_xml_string(value) }.compact.join(separator)
          end

          # Appends a text-only child element unless the value is nil.
          #
          # @param element [Element]
          # @param name [String]
          # @param value [Object]
          # @return [void]
          def add_child_value(element, name, value)
            text = to_xml_string(value)
            return if text.nil?

            element.add_child(Element.new(name, text: text))
          end

          # Adds unknown attributes and children back onto an element. Unknown content found inside
          # a wrapper element (see `wrapper_names`) is merged into the wrapper of the same name instead
          # of producing a second wrapper.
          #
          # @param element [Element]
          # @param attributes [Hash<String, String>]
          # @param children [Array<Element, Serializable>]
          # @param wrapper_names [Array<String>]
          # @return [void]
          def add_additional(element, attributes, children, wrapper_names = [])
            attributes.each do |name, value|
              element.attributes[name.to_s] = value.to_s unless element.attributes.key?(name.to_s)
            end
            children.each do |child|
              if child.is_a?(Element) && wrapper_names.include?(child.name)
                wrapper = element.child(child.name)
                unless wrapper.nil?
                  child.namespace_declarations.each { |prefix, uri| wrapper.namespace_declarations[prefix] ||= uri }
                  child.attributes.each { |name, value| wrapper.attributes[name] = value unless wrapper.attributes.key?(name) }
                  wrapper.text ||= child.text
                  child.children.each { |grand_child| wrapper.add_child(grand_child) }
                  next
                end
              end
              element.add_child(child)
            end
          end

          # -----------------------------------------------------------------------------------------
          # Parsing
          # -----------------------------------------------------------------------------------------

          # Parses an XML document into an {Element} tree.
          #
          # DOCTYPE declarations (and therefore entity definitions) are rejected and no network access
          # is performed while parsing.
          #
          # @param xml [String]
          # @return [Element]
          # @raise [ArgumentError] if the document is empty, malformed or declares a DOCTYPE
          def parse_document(xml)
            raise ArgumentError, "Cannot parse XML from an empty string" if xml.nil? || xml.strip.empty?
            raise ArgumentError, "XML documents with a DOCTYPE declaration are not allowed" if xml.match?(DOCTYPE_IN_PROLOG)

            document = begin
              ::REXML::Document.new(xml)
            rescue ::REXML::ParseException => e
              raise ArgumentError, "Malformed XML: #{e.message.lines.first&.strip}"
            end
            raise ArgumentError, "XML documents with a DOCTYPE declaration are not allowed" unless document.doctype.nil?

            root = document.root
            raise ArgumentError, "Malformed XML: no root element" if root.nil?

            from_rexml(root)
          end

          # Parses a document and checks that its root element has the expected name (and namespace, if given).
          #
          # @param xml [String]
          # @param expected_name [String]
          # @param expected_namespace [String, nil]
          # @return [Element]
          def parse_root(xml, expected_name, expected_namespace = nil)
            root = parse_document(xml)
            require_name(root, expected_name, expected_namespace)
            root
          end

          # Unqualified elements are accepted for any expected namespace; only an explicitly different
          # namespace is rejected, since many producers emit XML without namespace declarations.
          #
          # @raise [ArgumentError] if the element's name (or namespace, if given) does not match
          def require_name(element, expected_name, expected_namespace = nil)
            raise ArgumentError, "Expected <#{expected_name}> element but found <#{element.name}>" if element.name != expected_name

            return if expected_namespace.nil? || element.namespace.nil? || element.namespace == expected_namespace

            raise ArgumentError,
                  "Expected <#{expected_name}> in namespace '#{expected_namespace}' but found namespace '#{element.namespace}'"
          end

          private def from_rexml(node)
            namespace = node.namespace
            element = Element.new(
              node.name,
              namespace: namespace.nil? || namespace.empty? ? nil : namespace,
              prefix: node.prefix.nil? || node.prefix.empty? ? nil : node.prefix
            )
            node.attributes.each_attribute do |attribute|
              if attribute.prefix == "xmlns" || attribute.expanded_name == "xmlns"
                declared_prefix = attribute.expanded_name == "xmlns" ? "" : attribute.name
                element.namespace_declarations[declared_prefix] = attribute.value
                next
              end
              element.attributes[attribute.expanded_name] = attribute.value
              if !attribute.prefix.to_s.empty? && attribute.prefix != "xml"
                uri = node.namespace(attribute.prefix)
                element.namespace_declarations[attribute.prefix] ||= uri unless uri.nil?
              end
            end
            text = +""
            node.each_child do |child|
              case child
              when ::REXML::Text
                text << child.value
              when ::REXML::Element
                element.add_child(from_rexml(child))
              end
            end
            # Text nodes are concatenated (whitespace-only text is dropped); interleaving with child
            # elements is not preserved, matching serialization which writes text before children.
            element.text = text.strip.empty? ? nil : text
            element
          end

          # @raise [ArgumentError] if the attribute is missing
          def require_attribute(element, name)
            value = element.attribute(name)
            raise ArgumentError, "Missing required attribute '#{name}' on <#{element.name}>" if value.nil?

            value
          end

          # @raise [ArgumentError] if the element has no text
          def require_text(element)
            raise ArgumentError, "Missing required text content on <#{element.name}>" if element.text.nil?

            element.text
          end

          # @return [String, nil] the text of the first child with the given name
          def child_text(element, name)
            element.child(name)&.text
          end

          # @raise [ArgumentError] if the child element or its text is missing
          def require_child_text(element, name)
            child = element.child(name)
            raise ArgumentError, "Missing required child <#{name}> on <#{element.name}>" if child.nil?

            require_text(child)
          end

          # Splits a separator-delimited raw value into parsed items.
          #
          # @return [Array, nil]
          def parse_list(raw, separator, &)
            return nil if raw.nil?

            raw.split(Regexp.new(Regexp.escape(separator))).reject(&:empty?).map(&)
          end

          # @return [Array] the parsed text of all children with the given name
          def parse_child_values(parent, name, &parse)
            return [] if parent.nil?

            parent.children_named(name).map { |child| parse.call(child.text.to_s) }
          end

          # Parses the children of `parent` that have a parser (keyed by element name), in order.
          #
          # @param parent [Element, nil]
          # @param parsers [Hash<String, Proc>]
          # @return [Array]
          def parse_children(parent, parsers)
            return [] if parent.nil?

            parent.children.filter_map do |child|
              element = child.to_xml_element
              parser = parsers[element.name]
              parser&.call(element)
            end
          end

          # @return [Object, nil] the first child with a parser, parsed
          def parse_child(parent, parsers)
            parent.children.each do |child|
              element = child.to_xml_element
              parser = parsers[element.name]
              return parser.call(element) unless parser.nil?
            end
            nil
          end

          # @raise [ArgumentError] if no child with a parser is present
          def require_child(parent, parsers)
            result = parse_child(parent, parsers)
            return result unless result.nil?

            raise ArgumentError, "Missing required child element (one of #{parsers.keys.join(", ")}) on <#{parent.name}>"
          end

          # -----------------------------------------------------------------------------------------
          # Scalar conversion
          # -----------------------------------------------------------------------------------------

          def parse_string(raw)
            raw
          end

          def parse_integer(raw)
            Integer(raw.strip, 10)
          rescue ::ArgumentError
            raise ArgumentError, "Expected an integer but found '#{raw}'"
          end

          def parse_float(raw)
            Float(raw.strip)
          rescue ::ArgumentError
            raise ArgumentError, "Expected a number but found '#{raw}'"
          end

          def parse_boolean(raw)
            normalized = raw.strip.downcase
            return true if TRUE_VALUES.include?(normalized)
            return false if FALSE_VALUES.include?(normalized)

            raise ArgumentError, "Expected a boolean but found '#{raw}'"
          end

          # @param enum [Module] an `Internal::Types::Enum`
          # @raise [ArgumentError] if the value is not a member of the enum
          def parse_enum(raw, enum)
            value = raw.strip
            raise ArgumentError, "'#{raw}' is not a valid #{enum.name}" unless enum.values.include?(value)

            value
          end

          # @raise [ArgumentError] if the value differs from the literal
          def parse_literal(raw, expected)
            actual = expected.is_a?(TrueClass) || expected.is_a?(FalseClass) ? parse_boolean(raw) : raw.strip
            raise ArgumentError, "Expected literal '#{expected}' but found '#{raw}'" unless actual == expected

            expected
          end

          # -----------------------------------------------------------------------------------------
          # Unknown content
          # -----------------------------------------------------------------------------------------

          # @return [Hash<String, String>] attributes other than the known names, plus the namespace
          #   declarations any prefixed unknown attribute depends on so it stays well-formed
          def additional_attributes(element, known_names)
            result = {}
            element.attributes.each do |name, value|
              next if known_names.include?(name)

              result[name] = value
              colon = name.index(":")
              next if colon.nil?

              prefix = name[0, colon]
              uri = element.namespace_declarations[prefix]
              result["xmlns:#{prefix}"] = uri unless uri.nil?
            end
            result
          end

          # Collects the child elements the typed model does not know about. For wrapper elements,
          # a copy carrying only the wrapper's unknown attributes, text and items is kept.
          #
          # @param known_names [Array<String>]
          # @param wrappers [Hash<String, Array<String>>] known item names per wrapper element name
          # @return [Array<Element>]
          def additional_children(element, known_names, wrappers = {})
            result = []
            element.children.each do |child|
              child_element = child.to_xml_element
              known_items = wrappers[child_element.name]
              if known_items.nil?
                result << child unless known_names.include?(child_element.name)
                next
              end
              rest = Element.new(
                child_element.name,
                text: child_element.text,
                attributes: child_element.attributes,
                namespace: child_element.namespace,
                prefix: child_element.prefix
              )
              rest.namespace_declarations.merge!(child_element.namespace_declarations)
              child_element.children.each do |item|
                rest.add_child(item) unless known_items.include?(item.to_xml_element.name)
              end
              result << rest if !rest.text.nil? || !rest.attributes.empty? || !rest.children.empty?
            end
            result
          end
        end
      end
    end
  end
end
