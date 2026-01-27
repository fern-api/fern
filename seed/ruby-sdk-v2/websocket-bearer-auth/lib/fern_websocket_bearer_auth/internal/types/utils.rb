# frozen_string_literal: true

module FernWebsocketBearerAuth
  module Internal
    module Types
      # Utilities for dealing with and checking types
      module Utils
        # Wraps a type into a type function
        #
        # @param type [Proc, Object]
        # @return [Proc]
        def self.wrap_type(type)
          case type
          when Proc
            type
          else
            -> { type }
          end
        end

        # Resolves a type or type function into a type
        #
        # @param type [Proc, Object]
        # @return [Object]
        def self.unwrap_type(type)
          type.is_a?(Proc) ? type.call : type
        end

        def self.coerce(target, value, strict: false)
          type = unwrap_type(target)

          case type
          in Array
            case value
            when ::Array
              return type.coerce(value, strict: strict)
            when Set, ::Hash
              return coerce(type, value.to_a)
            end
          in Hash
            case value
            when ::Hash
              return type.coerce(value, strict: strict)
            when ::Array
              return coerce(type, value.to_h)
            end
          in ->(t) { t <= NilClass }
            return nil
          in ->(t) { t <= String }
            case value
            when String, Symbol, Numeric, TrueClass, FalseClass
              return value.to_s
            end
          in ->(t) { t <= Symbol }
            case value
            when Symbol, String
              return value.to_sym
            end
          in ->(t) { t <= Integer }
            case value
            when Numeric, String, Time
              return value.to_i
            end
          in ->(t) { t <= Float }
            case value
            when Numeric, Time, String
              return value.to_f
            end
          in ->(t) { t <= Model }
            case value
            when type
              return value
            when ::Hash
              return type.coerce(value, strict: strict)
            end
          in Module
            case type
            in ->(t) {
                 t.singleton_class.include?(Enum) ||
                   t.singleton_class.include?(Union)
               }
              return type.coerce(value, strict: strict)
            else
              value
            end
          else
            value
          end

          raise Errors::TypeError, "cannot coerce value of type `#{value.class}` to `#{target}`" if strict

          value
        end

        def self.symbolize_keys(hash)
          hash.transform_keys(&:to_sym)
        end

        # Converts camelCase keys to snake_case symbols
        # This allows SDK methods to accept both snake_case and camelCase keys
        # e.g., { refundMethod: ... } becomes { refund_method: ... }
        #
        # @param hash [Hash]
        # @return [Hash]
        def self.normalize_keys(hash)
          hash.transform_keys do |key|
            key_str = key.to_s
            # Convert camelCase to snake_case
            snake_case = key_str.gsub(/([a-z\d])([A-Z])/, '\1_\2').downcase
            snake_case.to_sym
          end
        end
      end
    end
  end
end
