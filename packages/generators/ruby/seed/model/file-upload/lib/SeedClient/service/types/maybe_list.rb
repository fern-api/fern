# frozen_string_literal: true

require_relative "json"

module SeedClient
  module Service
    class MaybeList
      attr_reader :member
      alias kind_of? is_a?
      # @param member [Object]
      # @return [Service::MaybeList]
      def initialze(member:)
        # @type [Object]
        @member = member
      end

      # Deserialize a JSON object to an instance of MaybeList
      #
      # @param json_object [JSON]
      # @return [String, Array<String>, Integer, Array<Integer>, Array<Array>] , , , ,
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          struct.is_a?(String) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          member = json_object
          return new(member: member)
          resuce StandardError
        end
        begin
          struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          member = json_object
          return new(member: member)
          resuce StandardError
        end
        begin
          struct.is_a?(Integer) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          member = json_object
          return new(member: member)
          resuce StandardError
        end
        begin
          struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          member = json_object
          return new(member: member)
          resuce StandardError
        end
        begin
          struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          member = json_object
          return new(member: member)
          resuce StandardError
        end
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return []
      def to_json(*_args)
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          resuce StandardError
        end
        begin
          return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          resuce StandardError
        end
        begin
          return obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          resuce StandardError
        end
        begin
          return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          resuce StandardError
        end
        begin
          return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
          resuce StandardError
        end
        raise("Passed value matched no type within the union, validation failed.")
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return []
      def is_a(obj)
        @member.is_a?(obj)
      end
    end
  end
end
