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
            element.children.each do |child|
              if child.is_a?(Text)
                output << escape_text(child.value)
              else
                write_element(output, child.to_xml_element, scope)
              end
            end
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
          # A String is already in wire form (e.g. "speech dtmf") and is written as-is; any
          # other single value (for example a Symbol) is written on its own.
          #
          # @param values [Enumerable, String, Object, nil]
          # @param separator [String]
          # @return [String, nil]
          def join_values(values, separator)
            return nil if values.nil?
            return to_xml_string(values) if values.is_a?(::String)

            list_items(values).map { |value| to_xml_string(value) }.compact.join(separator)
          end

          # Normalizes a list-valued property so a single value is treated as a one-item list.
          # A Hash is a single (model-like) value, not a list of pairs.
          #
          # @param value [Enumerable, Object]
          # @return [Array]
          def list_items(value)
            value.is_a?(::Enumerable) && !value.is_a?(::Hash) ? value.to_a : [value]
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
                  merge_wrapper!(wrapper, child)
                  next
                end
              end
              element.add_child(child)
            end
          end

          # Appends the typed children, the additional children and the text segments to `element` in
          # content order. `content` decides the order; typed or additional children missing from it
          # are appended after it (typed first), so directly assigned properties still render. Wrapped
          # lists render as one wrapper element, placed where the first wrapper of that name or the
          # first item of that list appears in `content`; a raw wrapper element added with `add_child`
          # is merged into it rather than written as a second wrapper. Nodes in `content` that are neither typed,
          # additional nor text are not written.
          #
          # @param element [Element]
          # @param content [Array<Element, Serializable, Text>]
          # @param typed [Array<Element, Serializable>] typed child elements, in property order
          # @param wrapped [Hash<String, Array<Element, Serializable>>] items of each wrapped list, keyed by wrapper name
          # @param additional [Array<Element, Serializable>]
          # @param attributes [Hash<String, String>] additional attributes
          # @return [void]
          def add_content(element, content, typed, wrapped, additional, attributes = {})
            remaining = {}.compare_by_identity
            (typed + additional).each { |node| remaining[node] = (remaining[node] || 0) + 1 }
            wrapper_of = {}.compare_by_identity
            wrapped.each { |name, items| items.each { |item| wrapper_of[item] = name } }
            wrappers = {}
            emit_wrapper = ->(name) { emit_wrapper!(element, name, wrapped, wrappers) }
            content.each do |node|
              if node.is_a?(Text)
                element.add_child(node)
              elsif (remaining[node] || 0).positive?
                remaining[node] -= 1
                if node.is_a?(Element) && wrapped.key?(node.name)
                  emit_wrapper.call(node.name)
                  merge_wrapper!(wrappers[node.name], node)
                else
                  element.add_child(node)
                end
              elsif wrapper_of.key?(node)
                emit_wrapper.call(wrapper_of[node])
              elsif node.is_a?(Element) && wrapped.key?(node.name)
                emit_wrapper.call(node.name)
              end
            end
            typed.each do |node|
              next unless (remaining[node] || 0).positive?

              remaining[node] -= 1
              element.add_child(node)
            end
            wrapped.each_key { |name| emit_wrapper.call(name) }
            leftover = additional.select do |node|
              keep = (remaining[node] || 0).positive?
              remaining[node] -= 1 if keep
              keep
            end
            add_additional(element, attributes, leftover, wrapped.keys)
          end

          private def merge_wrapper!(wrapper, raw)
            raw.namespace_declarations.each { |prefix, uri| wrapper.namespace_declarations[prefix] ||= uri }
            raw.attributes.each { |name, value| wrapper.attributes[name] = value unless wrapper.attributes.key?(name) }
            wrapper.text ||= raw.text
            raw.children.each { |grand_child| wrapper.add_child(grand_child) }
          end

          private def emit_wrapper!(element, name, wrapped, wrappers)
            return if wrappers.key?(name)

            wrapper = Element.new(name)
            element.add_child(wrapper)
            wrapped[name].each { |item| wrapper.add_child(item) }
            wrappers[name] = wrapper
          end

          # Builds the content list of a parsed element: its text segments, the typed children (taken
          # in document order from `typed`), wrapper elements (as parsed) and the additional children.
          #
          # @param element [Element]
          # @param typed [Array<Array(Array<String>, Array<Serializable>)>] pairs of element names and
          #   the typed children parsed from elements with those names, in document order
          # @param additional [Array<Element, Serializable>]
          # @param wrapper_names [Array<String>]
          # @return [Array<Element, Serializable, Text>]
          def content(element, typed, additional, wrapper_names = [])
            by_name = {}
            typed.each_with_index { |(names, _nodes), index| names.each { |name| by_name[name] = index } }
            positions = Array.new(typed.length, 0)
            additional_ids = {}.compare_by_identity
            additional.each { |node| additional_ids[node] = true }
            element.children.filter_map do |child|
              next child if child.is_a?(Text)

              name = child.to_xml_element.name
              index = by_name[name]
              if index.nil?
                next child if wrapper_names.include?(name) || additional_ids.key?(child)

                next nil
              end
              node = typed[index][1][positions[index]]
              positions[index] += 1 unless node.nil?
              node
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
            has_element = false
            node.each_child do |child|
              case child
              when ::REXML::Text
                if has_element
                  append_parsed_text(element, child.value)
                else
                  text << child.value
                end
              when ::REXML::Element
                has_element = true
                element.add_child(from_rexml(child))
              end
            end
            # Text before the first child element is the element's text (dropped when whitespace-only);
            # text between and after child elements is kept as Text segments in document order.
            element.text = text.strip.empty? ? nil : text
            element
          end

          # Appends character data read after a child element. Whitespace-only text spanning a line
          # break is pretty-print indentation and is dropped; whitespace-only text without a line break
          # (e.g. a space between two inline children) is significant and kept. Adjacent segments are
          # merged.
          private def append_parsed_text(element, text)
            return if indentation?(text)

            last = element.children.last
            if last.is_a?(Text)
              last.value += text
            else
              element.add_text(text)
            end
          end

          private def indentation?(text)
            text.strip.empty? && text.match?(/[\r\n]/)
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

            parent.child_elements.filter_map do |element|
              parser = parsers[element.name]
              parser&.call(element)
            end
          end

          # @return [Object, nil] the first child with a parser, parsed
          def parse_child(parent, parsers)
            parent.child_elements.each do |element|
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

          # Enums are open on the wire: a value the enum does not declare is kept so documents
          # written by a newer API version still parse and round-trip.
          #
          # @param _enum [Module] an `Internal::Types::Enum`
          # @return [String] the stripped value, whether or not it is a declared member
          def parse_enum(raw, _enum)
            raw.strip
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
              next if child.is_a?(Text)

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
                rest.add_child(item) unless !item.is_a?(Text) && known_items.include?(item.to_xml_element.name)
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
