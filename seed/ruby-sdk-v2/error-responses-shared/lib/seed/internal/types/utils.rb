# frozen_string_literal: true

module Seed
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

        EXACT_SCALAR_TYPES = [String, Integer, Float].freeze
        private_constant :EXACT_SCALAR_TYPES

        def self.coerce(target, value, strict: false)
          type = unwrap_type(target)

          # Fast path: exact String/Integer/Float instances are returned as-is, as the branches below would.
          # Subclasses still go through their `to_s`/`to_i`/`to_f` conversion.
          return value if EXACT_SCALAR_TYPES.include?(type) && value.instance_of?(type)

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
          in Class if type <= NilClass
            return nil
          in Class if type <= String
            case value
            when String, Symbol, Numeric, TrueClass, FalseClass
              return value.to_s
            end
          in Class if type <= Symbol
            case value
            when Symbol, String
              return value.to_sym
            end
          in Class if type <= Integer
            case value
            when Numeric, String, Time
              return value.to_i
            when Symbol
              # JSON object keys are parsed as symbols, so numeric map keys arrive as e.g. :"1"
              parsed = Integer(value.to_s, 10, exception: false)
              return parsed unless parsed.nil?
            end
          in Class if type <= Float
            case value
            when Integer
              # Whole numbers keep their Integer value, so they serialize as `5` rather than `5.0`.
              return value
            when Numeric, Time, String
              return value.to_f
            when Symbol
              parsed = Float(value.to_s, exception: false)
              return parsed unless parsed.nil?
            end
          in Class if type <= Model
            case value
            when type
              return value
            when ::Hash
              return type.coerce(value, strict: strict)
            end
          in Module
            case type
            in Enum | Union
              return type.coerce(value, strict: strict)
            else
              value # rubocop:disable Lint/Void
            end
          else
            value # rubocop:disable Lint/Void
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

        # Converts Time values (including ActiveSupport::TimeWithZone), recursively within hashes and arrays, to
        # RFC 3339 strings with millisecond precision. `Time#to_s` (e.g. "2026-10-16 01:40:16 UTC") is not RFC 3339.
        # Date and DateTime values are left unchanged because their `to_s` output is already ISO 8601.
        #
        # @param value [Object]
        # @return [Object]
        def self.serialize_times(value)
          case value
          when ::Hash
            value.transform_values { |item| serialize_times(item) }
          when ::Array
            value.map { |item| serialize_times(item) }
          else
            value.is_a?(::Time) ? value.iso8601(3) : value
          end
        end
      end
    end
  end
end
