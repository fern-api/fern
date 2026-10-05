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
      # `to_xml`/`from_xml`, unknown attribute/child preservation and the generic `add_child`.
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

        # Appends an arbitrary child element; use this for elements the model does not know about.
        #
        # @param child [Element, Serializable]
        # @return [Element, Serializable] the child
        def add_child(child)
          additional_children << child
          child
        end

        # @return [Element]
        def to_xml_element
          klass = self.class
          element = Element.new(klass.xml_name, namespace: klass.xml_namespace, prefix: klass.xml_prefix)
          wrapper_names = []
          klass.xml_properties.each do |property|
            value = public_send(property.field)
            case property.kind
            when :attribute
              text = xml_scalar_string(property, value)
              element.set_attribute(property.xml_name, text) unless text.nil?
            when :text
              element.text = xml_scalar_string(property, value)
            when :element
              wrapper_names << property.xml_name if property.wrapped
              write_xml_children(property, value, element)
            end
          end
          klass.extra_fields.each_key do |name|
            value = @data[name]
            element.set_attribute(name, Utils.to_xml_string(value)) unless value.nil?
          end
          Utils.add_additional(element, additional_attributes, additional_children, wrapper_names)
          element
        end

        # @param xml_declaration [Boolean] whether to prepend `<?xml version="1.0" encoding="UTF-8"?>`
        # @return [String]
        def to_xml(xml_declaration: false)
          Utils.serialize(to_xml_element, xml_declaration: xml_declaration)
        end

        # @return [String] the XML, including the declaration for root elements
        def to_s
          to_xml(xml_declaration: self.class.xml_root?)
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

        private def write_xml_children(property, value, element)
          return if value.nil?

          target = element
          if property.wrapped
            target = Element.new(property.xml_name)
            element.add_child(target)
          end
          values = property.list ? value : [value]
          values.each do |item|
            next if item.nil?

            if property.object?
              target.add_child(item)
            else
              Utils.add_child_value(target, property.xml_name, item)
            end
          end
        end
      end
    end
  end
end
