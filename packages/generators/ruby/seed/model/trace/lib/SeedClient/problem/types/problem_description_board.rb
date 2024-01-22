# frozen_string_literal: true

require_relative "json"
require_relative "commons/types/VariableValue"

module SeedClient
  module Problem
    class ProblemDescriptionBoard
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Problem::ProblemDescriptionBoard]
      def initialze(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of ProblemDescriptionBoard
      #
      # @param json_object [JSON]
      # @return [Problem::ProblemDescriptionBoard]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "html"
                   json_object.value
                 when "variable"
                   Commons::VariableValue.from_json(json_object: json_object.value)
                 when "testCaseId"
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
        when "html"
        when "variable"
        when "testCaseId"
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
        when "html"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "variable"
          Commons::VariableValue.validate_raw(obj: obj)
        when "testCaseId"
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
      # @return [Problem::ProblemDescriptionBoard]
      def self.html(member:)
        new(member: member, discriminant: "html")
      end

      # @param member [Commons::VariableValue]
      # @return [Problem::ProblemDescriptionBoard]
      def self.variable(member:)
        new(member: member, discriminant: "variable")
      end

      # @param member [String]
      # @return [Problem::ProblemDescriptionBoard]
      def self.test_case_id(member:)
        new(member: member, discriminant: "testCaseId")
      end
    end
  end
end
