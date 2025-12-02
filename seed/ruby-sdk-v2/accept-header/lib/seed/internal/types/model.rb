# frozen_string_literal: true

module Seed
  module Internal
    module Types
      # @abstract
      #
      # An abstract model that all data objects will inherit from
      class Model
        include Type

        class << self
          # The defined fields for this model
          #
          # @api private
          #
          # @return [Hash<Symbol, Field>]
          def fields
            @fields ||= if self < Seed::Internal::Types::Model
                          superclass.fields.dup
                        else
                          {}
                        end
          end

          # Any extra fields that have been created from instantiation
          #
          # @api private
          #
          # @return [Hash<Symbol, Field>]
          def extra_fields
            @extra_fields ||= {}
          end

          # Define a new field on this model
          #
          # @param name [Symbol] The name of the field
          # @param type [Class] Type of the field
          # @option optional [Boolean] If it is an optional field
          # @option nullable [Boolean] If it is a nullable field
          # @option api_name [Symbol, String] Name in the API of this field. When serializing/deserializing, will use
          #   this field name
          # @return [void]
          def field(name, type, optional: false, nullable: false, api_name: nil, default: nil)
            add_field_definition(name: name, type: type, optional: optional, nullable: nullable, api_name: api_name,
                                 default: default)

            define_accessor(name)
            define_setter(name)
          end

          # Define a new literal for this model
          #
          # @param name [Symbol]
          # @param value [Object]
          # @option api_name [Symbol, String]
          # @return [void]
          def literal(name, value, api_name: nil)
            add_field_definition(name: name, type: value.class, optional: false, nullable: false, api_name: api_name,
                                 value: value)

            define_accessor(name)
          end

          # Adds a new field definition into the class's fields registry
          #
          # @api private
          #
          # @param name [Symbol]
          # @param type [Class]
          # @option optional [Boolean]
          # @return [void]
          private def add_field_definition(name:, type:, optional:, nullable:, api_name:, default: nil, value: nil)
            fields[name.to_sym] =
              Field.new(name: name, type: type, optional: optional, nullable: nullable, api_name: api_name,
                        value: value, default: default)
          end

          # Adds a new field definition into the class's extra fields registry
          #
          # @api private
          #
          # @param name [Symbol]
          # @param type [Class]
          # @option required [Boolean]
          # @option optional [Boolean]
          # @return [void]
          def add_extra_field_definition(name:, type:)
            return if extra_fields.key?(name.to_sym)

            extra_fields[name.to_sym] = Field.new(name: name, type: type, optional: true, nullable: false)

            define_accessor(name)
            define_setter(name)
          end

          # @api private
          private def define_accessor(name)
            method_name = name.to_sym

            define_method(method_name) do
              @data[name]
            end
          end

          # @api private
          private def define_setter(name)
            method_name = :"#{name}="

            define_method(method_name) do |val|
              @data[name] = val
            end
          end

          def coerce(value, strict: (respond_to?(:strict?) ? strict? : false))
            return value if value.is_a?(self)

            return value unless value.is_a?(::Hash)

            new(value)
          end

          def load(str)
            coerce(::JSON.parse(str, symbolize_names: true))
          end

          def ===(instance)
            instance.class.ancestors.include?(self)
          end
        end

        # Creates a new instance of this model
        # TODO: Should all this logic be in `#coerce` instead?
        #
        # @param values [Hash]
        # @option strict [Boolean]
        # @return [self]
        def initialize(values = {})
          @data = {}

          values = Utils.symbolize_keys(values.dup)

          self.class.fields.each do |field_name, field|
            value = values.delete(field.api_name.to_sym) || values.delete(field.api_name) || values.delete(field_name)

            field_value = value || (if field.literal?
                                      field.value
                                    elsif field.default
                                      field.default
                                    end)

            @data[field_name] = Utils.coerce(field.type, field_value)
          end

          # Any remaining values in the input become extra fields
          values.each do |name, value|
            self.class.add_extra_field_definition(name: name, type: value.class)

            @data[name.to_sym] = value
          end
        end

        def to_h
          self.class.fields.merge(self.class.extra_fields).each_with_object({}) do |(name, field), acc|
            # If there is a value present in the data, use that value
            # If there is a `nil` value present in the data, and it is optional but NOT nullable, exclude key altogether
            # If there is a `nil` value present in the data, and it is optional and nullable, use the nil value

            value = @data[name]

            next if value.nil? && field.optional && !field.nullable

            if value.is_a?(::Array)
              value = value.map { |item| item.respond_to?(:to_h) ? item.to_h : item }
            elsif value.respond_to?(:to_h)
              value = value.to_h
            end

            acc[field.api_name] = value
          end
        end

        def ==(other)
          self.class == other.class && to_h == other.to_h
        end

        # @return [String]
        def inspect
          attrs = @data.map do |name, value|
            field = self.class.fields[name] || self.class.extra_fields[name]
            display_value = field&.sensitive? ? "[REDACTED]" : value.inspect
            "#{name}=#{display_value}"
          end

          "#<#{self.class.name}:0x#{object_id&.to_s(16)} #{attrs.join(" ")}>"
        end
      end
    end
  end
end
