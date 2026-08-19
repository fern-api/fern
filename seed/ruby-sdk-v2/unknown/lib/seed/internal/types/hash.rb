# frozen_string_literal: true

module Seed
  module Internal
    module Types
      class Hash
        include Type

        attr_reader :key_type, :value_type

        class << self
          def [](key_type, value_type)
            new(key_type, value_type)
          end
        end

        def initialize(key_type, value_type)
          @key_type = key_type
          @value_type = value_type
        end

        def coerce(value, strict: strict?)
          unless value.is_a?(::Hash)
            raise Errors::TypeError, "not hash" if strict

            return value
          end

          value.to_h do |k, v|
            [Utils.coerce(key_type, k, strict: strict), Utils.coerce(value_type, v, strict: strict)]
          end
        end
      end
    end
  end
end
