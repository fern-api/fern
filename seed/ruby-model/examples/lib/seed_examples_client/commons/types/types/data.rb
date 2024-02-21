# frozen_string_literal: true

require "json"

module SeedExamplesClient
  module Commons
    class Types
      class Data
        attr_reader :member, :discriminant

        private_class_method :new
        alias kind_of? is_a?
        # @param member [Object]
        # @param discriminant [String]
        # @return [Commons::Types::Data]
        def initialize(member:, discriminant:)
          # @type [Object]
          @member = member
          # @type [String]
          @discriminant = discriminant
        end

        # Deserialize a JSON object to an instance of Data
        #
        # @param json_object [JSON]
        # @return [Commons::Types::Data]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          member = case struct.type
                   when "string"
                     json_object.value
                   when "base64"
                     json_object.value
                   else
                     json_object
                   end
          new(member: member, discriminant: struct.type)
        end

        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [JSON]
        def to_json(*_args)
          case @discriminant
          when "string"
          when "base64"
          end
          { "type": @discriminant, "value": @member }.to_json
          @member.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          case obj.type
          when "string"
            obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          when "base64"
            obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          else
            raise("Passed value matched no type within the union, validation failed.")
          end
        end

        # For Union Types, is_a? functionality is delegated to the wrapped member.
        #
        # @param obj [Object]
        # @return [Boolean]
        def is_a?(obj)
          @member.is_a?(obj)
        end

        # @param member [String]
        # @return [Commons::Types::Data]
        def self.string(member:)
          new(member: member, discriminant: "string")
        end

        # @param member [String]
        # @return [Commons::Types::Data]
        def self.base_64(member:)
          new(member: member, discriminant: "base64")
        end
      end
    end
  end
end
