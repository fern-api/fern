# frozen_string_literal: true
require "json"
require "commons/types/ProblemId"
require "problem/types/CreateProblemError"

module SeedClient
  module Problem
    class CreateProblemResponse
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Problem::CreateProblemResponse] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of CreateProblemResponse
      #
      # @param json_object [JSON] 
      # @return [Problem::CreateProblemResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "success"
          member = Commons::ProblemId.from_json(json_object: json_object.value)
        when "error"
          member = Problem::CreateProblemError.from_json(json_object: json_object.value)
        else
          member = Commons::ProblemId.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "success"
          { type: @discriminant, value: @member }.to_json()
        when "error"
          { type: @discriminant, value: @member }.to_json()
        else
          { type: @discriminant, value: @member }.to_json()
        end
        @member.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        case obj.type
        when "success"
          ProblemId.validate_raw(obj: obj)
        when "error"
          CreateProblemError.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end
      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object] 
      # @return [] 
      def is_a(obj)
        @member.is_a?(obj)
      end
      # @param member [Commons::ProblemId] 
      # @return [Problem::CreateProblemResponse] 
      def self.success(member:)
        new(member: member, discriminant: "success")
      end
      # @param member [Problem::CreateProblemError] 
      # @return [Problem::CreateProblemResponse] 
      def self.error(member:)
        new(member: member, discriminant: "error")
      end
    end
  end
end