# frozen_string_literal: true

module Seed
  module Internal
    module Types
      # Define a union between two types
      module Union
        include Seed::Internal::Types::Type

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

        # Resolves the type of a value to be one of the members
        #
        # @param value [Object]
        # @return [Class]
        private def resolve_member(value)
          if discriminated? && value.is_a?(::Hash)
            discriminant_value = value.fetch(@discriminant, nil)

            return if discriminant_value.nil?

            members.to_h[discriminant_value]&.call
          else
            # First try exact type matching
            result = members.find do |_key, mem|
              member_type = Utils.unwrap_type(mem)
              value.is_a?(member_type)
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
                  Utils.coerce(member_type, value, strict: true)
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

          Utils.coerce(type, value, strict: strict)
        end
      end
    end
  end
end
