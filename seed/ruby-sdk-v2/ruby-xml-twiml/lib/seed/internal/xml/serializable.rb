# frozen_string_literal: true

module Seed
  module Internal
    module Xml
      # Marks a property as holding a fixed literal value.
      Literal = Struct.new(:value)

      # @api private
      #
      # Describes how one model field maps onto XML.
      class Property
        attr_reader :field, :kind, :xml_name, :type, :list, :wrapped, :separator, :optional

        def initialize(field:, kind:, xml_name:, type:, list: false, wrapped: false, separator: " ", optional: true)
          @field = field
          @kind = kind
          @xml_name = xml_name
          @type = type
          @list = list
          @wrapped = wrapped
          @separator = separator
          @optional = optional
        end

        # @return [Object] the resolved type: String, Integer, Float, Types::Boolean, an Enum module,
        #   a {Literal}, an XML-encoded model class or an Array of XML-encoded model classes
        def resolved_type
          @resolved_type ||= Types::Utils.unwrap_type(@type)
        end

        # @return [Boolean] whether the property holds XML-encoded child models
        def object?
          type = resolved_type
          return type.all? { |klass| klass.respond_to?(:xml_name) } if type.is_a?(::Array)

          type.respond_to?(:xml_name)
        end

        # @return [Array<Class>] the XML-encoded model classes this property can hold
        def object_types
          type = resolved_type
          type.is_a?(::Array) ? type : [type]
        end
      end

      # Mixed into XML-encoded models. Provides the class-level mapping DSL together with
      # `to_xml`/`from_xml`, unknown attribute/child preservation, the generic `add_child`/`add_text`
      # and the ordered {#content} that keeps mixed content in insertion order.
      #
      # Extra keyword arguments passed to the constructor are emitted as additional attributes.
      module Serializable
        def self.included(base)
          base.extend(ClassMethods)
        end

        module ClassMethods
          # @return [String] the element name
          attr_reader :xml_name
          # @return [String, nil] the element namespace URI
          attr_reader :xml_namespace
          # @return [String, nil] the element namespace prefix
          attr_reader :xml_prefix

          # Declares the element this class serializes to.
          def xml_element(name, namespace: nil, prefix: nil, root: false)
            @xml_name = name
            @xml_namespace = namespace
            @xml_prefix = prefix
            @xml_root = root
          end

          # @return [Boolean] whether this element is a document root (`to_s` then includes the XML declaration)
          def xml_root?
            defined?(@xml_root) ? @xml_root : false
          end

          # @return [Array<Property>]
          def xml_properties
            @xml_properties ||= []
          end

          # Maps a field onto an attribute.
          def xml_attribute(field, name, type, list: false, separator: " ", optional: true)
            xml_properties << Property.new(field: field, kind: :attribute, xml_name: name, type: type, list: list,
                                           separator: separator, optional: optional)
          end

          # Maps a field onto the element's text content.
          def xml_text(field, type, list: false, separator: " ", optional: true)
            xml_properties << Property.new(field: field, kind: :text, xml_name: nil, type: type, list: list,
                                           separator: separator, optional: optional)
          end

          # Maps a field onto child elements. `name` is the wrapper element for `wrapped: true`
          # lists, or the child element name for scalar values.
          def xml_child(field, type, name: nil, list: false, wrapped: false, optional: true)
            xml_properties << Property.new(field: field, kind: :element, xml_name: name, type: type, list: list,
                                           wrapped: wrapped, optional: optional)
          end

          # Parses an XML document into an instance of this class.
          #
          # @param xml [String]
          # @return [self]
          # @raise [ArgumentError] if the document is malformed or does not describe this element
          def from_xml(xml)
            from_xml_element(Utils.parse_root(xml, xml_name, xml_namespace))
          end

          # Converts a parsed {Element} into an instance of this class.
          #
          # @param element [Element]
          # @return [self]
          # @raise [ArgumentError] if the element does not describe this class
          def from_xml_element(element)
            Utils.require_name(element, xml_name, xml_namespace)
            values = {}
            known_attributes = []
            known_children = []
            wrappers = {}
            xml_properties.each do |property|
              case property.kind
              when :attribute
                known_attributes << property.xml_name
                values[property.field] = parse_xml_scalar(property, element.attribute(property.xml_name), element)
              when :text
                values[property.field] = parse_xml_scalar(property, element.text, element)
              when :element
                values[property.field] = parse_xml_children(property, element, known_children, wrappers)
              end
            end
            model = new(values)
            model.additional_attributes.merge!(Utils.additional_attributes(element, known_attributes))
            model.additional_children.concat(Utils.additional_children(element, known_children, wrappers))
            typed = xml_properties.filter_map do |property|
              next unless property.kind == :element && property.object? && !property.wrapped

              value = values[property.field]
              nodes = if value.nil?
                        []
                      elsif property.list
                        Utils.list_items(value)
                      else
                        [value]
                      end
              [property.object_types.map(&:xml_name), nodes]
            end
            has_text = xml_properties.any? { |property| property.kind == :text }
            model.content = Utils.content(element, typed, model.additional_children, wrappers.keys,
                                          include_text: !has_text)
            model
          end

          private def parse_xml_scalar(property, raw, element)
            if raw.nil?
              return nil if property.optional

              what = property.kind == :text ? "text content" : "attribute '#{property.xml_name}'"
              raise ArgumentError, "Missing required #{what} on <#{element.name}>"
            end
            parsed = if property.list
                       Utils.parse_list(raw, property.separator) { |item| parse_xml_value(property, item) }
                     else
                       parse_xml_value(property, raw)
                     end
            # Literal values are validated but not stored, so a parsed model equals a constructed one.
            property.resolved_type.is_a?(Literal) ? nil : parsed
          end

          private def parse_xml_value(property, raw)
            type = property.resolved_type
            case type
            when Literal then Utils.parse_literal(raw, type.value)
            when ->(t) { t == Integer } then Utils.parse_integer(raw)
            when ->(t) { t == Float } then Utils.parse_float(raw)
            when ->(t) { t == Types::Boolean } then Utils.parse_boolean(raw)
            when ->(t) { t.singleton_class.included_modules.include?(Types::Enum) } then Utils.parse_enum(raw, type)
            else Utils.parse_string(raw)
            end
          end

          private def parse_xml_children(property, element, known_children, wrappers)
            parent = element
            if property.wrapped
              known_children << property.xml_name
              parent = element.child(property.xml_name)
            end
            if property.object?
              parsers = property.object_types.to_h { |klass| [klass.xml_name, ->(child) { klass.from_xml_element(child) }] }
              names = parsers.keys
            else
              names = [property.xml_name]
              parsers = { property.xml_name => ->(child) { parse_xml_value(property, child.text.to_s) } }
            end
            if property.wrapped
              wrappers[property.xml_name] = names
            else
              known_children.concat(names)
            end
            if property.list
              if parent.nil?
                raise ArgumentError, "Missing required wrapper <#{property.xml_name}> on <#{element.name}>" unless property.optional

                return nil
              end

              children = Utils.parse_children(parent, parsers)
              return nil if children.empty? && property.optional && !property.wrapped

              children
            elsif parent.nil?
              raise ArgumentError, "Missing required wrapper <#{property.xml_name}> on <#{element.name}>" unless property.optional

              nil
            elsif property.optional
              Utils.parse_child(parent, parsers)
            else
              Utils.require_child(parent, parsers)
            end
          end
        end

        # @return [Hash<String, String>] attributes not declared on this class (preserved from parsing)
        def additional_attributes
          @additional_attributes ||= {}
        end

        # @return [Array<Element, Serializable>] child elements not declared on this class
        def additional_children
          @additional_children ||= []
        end

        # The element's content in order: typed child models, additional children, {Text}
        # segments and {Comment}s. Child builders, {#add_child}, {#add_text} and {#comment} append to it; `from_xml` fills it in
        # document order. Typed children assigned directly to a property but missing here are written
        # after it.
        #
        # @return [Array<Element, Serializable, Text, Comment>]
        def content
          @content ||= []
        end

        # @param content [Array<Element, Serializable, Text, Comment>]
        # @return [Array<Element, Serializable, Text, Comment>]
        def content=(content)
          @content = content.to_a.dup
        end

        # Builds the element from field values. A block receives the new instance so children can be
        # added inline: `Response.new { |r| r.say("hi") }`.
        #
        # @param values [Hash]
        # @yieldparam element [self]
        def initialize(values = {})
          super
          yield self if block_given?
        end

        # Appends an arbitrary child element; use this for elements the model does not know about.
        # Accepts an {Element} or model, or an element name with optional text and attributes
        # (`add_child("Custom", "v", a: "1")`); snake_case attribute keys are written in lowerCamelCase.
        #
        # @param child [Element, Serializable, String, Symbol]
        # @param value [Object, nil] text content, when `child` is an element name
        # @param attributes [Hash] attributes, when `child` is an element name
        # @return [Element, Serializable] the child
        def add_child(child, value = nil, **attributes)
          if child.is_a?(String) || child.is_a?(Symbol)
            child = Element.new(child.to_s, text: value.nil? ? nil : Utils.to_xml_string(value))
            attributes.each do |name, attribute|
              next if attribute.nil?

              child.set_attribute(name.to_s.gsub(/_([a-z\d])/) { Regexp.last_match(1).upcase },
                                  Utils.to_xml_string(attribute))
            end
          elsif !value.nil? || !attributes.empty?
            raise ArgumentError, "text and attributes can only be given together with an element name"
          end
          additional_children << child
          content << child
          child
        end

        # Appends a text segment after the children added so far (for mixed content such as
        # `<Say>Hi <break/> world</Say>`).
        #
        # @param text [String]
        # @return [self]
        def add_text(text)
          content << Text.new(text)
          self
        end

        # Appends an XML comment (`<!--text-->`) inside this element after the children added so far.
        #
        # @param text [String]
        # @return [self]
        def comment(text)
          content << Comment.new(text)
          self
        end

        # Adds an XML comment rendered immediately before this element (as a sibling in its parent,
        # or before the root element).
        #
        # @param text [String]
        # @return [self]
        def comment_before(text)
          content << Comment.before(text)
          self
        end

        # Adds an XML comment rendered immediately after this element (as a sibling in its parent,
        # or after the root element).
        #
        # @param text [String]
        # @return [self]
        def comment_after(text)
          content << Comment.after(text)
          self
        end

        # @return [Element]
        def to_xml_element
          klass = self.class
          element = Element.new(klass.xml_name, namespace: klass.xml_namespace, prefix: klass.xml_prefix)
          typed = []
          wrapped = {}
          klass.xml_properties.each do |property|
            value = public_send(property.field)
            case property.kind
            when :attribute
              text = xml_scalar_string(property, value)
              element.set_attribute(property.xml_name, text) unless text.nil?
            when :text
              element.text = xml_scalar_string(property, value)
            when :element
              collect_xml_children(property, value, typed, wrapped)
            end
          end
          klass.extra_fields.each_key do |name|
            value = @data[name]
            element.set_attribute(name, Utils.to_xml_string(value)) unless value.nil?
          end
          Utils.add_content(element, content, typed, wrapped, additional_children, additional_attributes)
          element
        end

        # @param xml_declaration [Boolean] whether to prepend `<?xml version="1.0" encoding="UTF-8"?>`
        # @return [String]
        def to_xml(xml_declaration: true)
          Utils.serialize(to_xml_element, xml_declaration: xml_declaration)
        end

        # @return [String] the XML document, including the declaration
        def to_s
          to_xml
        end

        def ==(other)
          other.is_a?(Serializable) && super && additional_attributes == other.additional_attributes &&
            additional_children.map(&:to_xml_element) == other.additional_children.map(&:to_xml_element)
        end

        private def xml_scalar_string(property, value)
          type = property.resolved_type
          value = type.value if type.is_a?(Literal)
          return nil if value.nil?

          return Utils.join_values(value, property.separator) if property.list

          Utils.to_xml_string(value)
        end

        # Records the typed children of one property: child models as-is and scalar values as
        # text-only elements, into `wrapped[name]` for wrapped lists or `typed` otherwise.
        private def collect_xml_children(property, value, typed, wrapped)
          return if value.nil?

          target = property.wrapped ? (wrapped[property.xml_name] ||= []) : typed
          values = property.list ? Utils.list_items(value) : [value]
          values.each do |item|
            next if item.nil?

            if property.object?
              target << item
            else
              text = Utils.to_xml_string(item)
              target << Element.new(property.xml_name, text: text) unless text.nil?
            end
          end
        end

        # Appends a child created by a typed child builder to the ordered content.
        private def record_content(child)
          content << child
        end
      end
    end
  end
end
