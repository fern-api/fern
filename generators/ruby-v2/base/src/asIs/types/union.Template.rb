# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Types
      # Define a union between two types
      module Union
        include <%= gem_namespace %>::Internal::Types::Type

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
            disciminant_value = value.fetch(@discriminant, nil)

            return if disciminant_value.nil?

            members.to_h[disciminant_value]&.call
          else
            members.find do |_key, mem|
              member_type = Utils.unwrap_type(mem)

              value.is_a?(member_type)
            end&.last&.call
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

          value = value.except(@discriminant) if type <= Model && value.is_a?(::Hash)

          Utils.coerce(type, value, strict: strict)
        end
      end
    end
  end
end 