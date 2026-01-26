# frozen_string_literal: true

module FernSingleUrlEnvironmentDefault
  module Internal
    module Types
      # Define a union between two types
      module Union
        include FernSingleUrlEnvironmentDefault::Internal::Types::Type

        def members
          @members ||= []
        end

        # Add a member to this union
        #
        # @param type [Object]
        # @option key [Symbol, String]
        # @return [void]
        def member(type, key: nil)
          members.push([key, Utils.wrap_type(type)])
          self
        end

        def member?(type)
          members.any? { |_key, type_fn| type == type_fn.call }
        end

        # Set the discriminant for this union
        #
        # @param key [Symbol, String]
        # @return [void]
        def discriminant(key)
          @discriminant = key
        end

        # @api private
        private def discriminated?
          !@discriminant.nil?
        end

        # Check if value matches a type, handling type wrapper instances
        # (Internal::Types::Hash and Internal::Types::Array instances)
        #
        # @param value [Object]
        # @param member_type [Object]
        # @return [Boolean]
        private def type_matches?(value, member_type)
          case member_type
          when FernSingleUrlEnvironmentDefault::Internal::Types::Hash
            value.is_a?(::Hash)
          when FernSingleUrlEnvironmentDefault::Internal::Types::Array
            value.is_a?(::Array)
          when Class, Module
            value.is_a?(member_type)
          else
            false
          end
        end

        # Resolves the type of a value to be one of the members
        #
        # @param value [Object]
        # @return [Class]
        private def resolve_member(value)
          if discriminated? && value.is_a?(::Hash)
            # Try both symbol and string keys for the discriminant
            discriminant_value = value.fetch(@discriminant, nil) || value.fetch(@discriminant.to_s, nil)

            return if discriminant_value.nil?

            # Convert to string for consistent comparison
            discriminant_str = discriminant_value.to_s

            # First try exact match
            members_hash = members.to_h
            result = members_hash[discriminant_str]&.call
            return result if result

            # Try case-insensitive match as fallback
            discriminant_lower = discriminant_str.downcase
            matching_keys = members_hash.keys.select { |k| k.to_s.downcase == discriminant_lower }

            # Only use case-insensitive match if exactly one key matches (avoid ambiguity)
            return members_hash[matching_keys.first]&.call if matching_keys.length == 1

            nil
          else
            # First try exact type matching
            result = members.find do |_key, mem|
              member_type = Utils.unwrap_type(mem)
              type_matches?(value, member_type)
            end&.last&.call

            return result if result

            # For Hash values, try to coerce into Model member types
            if value.is_a?(::Hash)
              members.find do |_key, mem|
                member_type = Utils.unwrap_type(mem)
                # Check if member_type is a Model class
                next unless member_type.is_a?(Class) && member_type <= Model

                # Try to coerce the hash into this model type with strict mode
                begin
                  candidate = Utils.coerce(member_type, value, strict: true)

                  # Validate that all required (non-optional) fields are present
                  # This ensures undiscriminated unions properly distinguish between member types
                  member_type.fields.each do |field_name, field|
                    raise Errors::TypeError, "Required field `#{field_name}` missing for union member #{member_type.name}" if candidate.instance_variable_get(:@data)[field_name].nil? && !field.optional
                  end

                  true
                rescue Errors::TypeError
                  false
                end
              end&.last&.call
            end
          end
        end

        def coerce(value, strict: strict?)
          type = resolve_member(value)

          unless type
            return value unless strict

            if discriminated?
              raise Errors::TypeError,
                    "value of type `#{value.class}` not member of union #{self}"
            end

            raise Errors::TypeError, "could not resolve to member of union #{self}"
          end

          coerced = Utils.coerce(type, value, strict: strict)

          # For discriminated unions, store the discriminant info on the coerced instance
          # so it can be injected back during serialization (to_h)
          if discriminated? && value.is_a?(::Hash) && coerced.is_a?(Model)
            discriminant_value = value.fetch(@discriminant, nil) || value.fetch(@discriminant.to_s, nil)
            if discriminant_value
              coerced.instance_variable_set(:@_fern_union_discriminant_key, @discriminant.to_s)
              coerced.instance_variable_set(:@_fern_union_discriminant_value, discriminant_value)
            end
          end

          coerced
        end

        # Parse JSON string and coerce to the correct union member type
        #
        # @param str [String] JSON string to parse
        # @return [Object] Coerced value matching a union member
        def load(str)
          coerce(::JSON.parse(str, symbolize_names: true))
        end
      end
    end
  end
end
