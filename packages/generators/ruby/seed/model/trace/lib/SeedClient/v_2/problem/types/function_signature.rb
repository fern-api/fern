# frozen_string_literal: true
require "json"
require "v_2/problem/types/VoidFunctionSignature"
require "v_2/problem/types/NonVoidFunctionSignature"
require "v_2/problem/types/VoidFunctionSignatureThatTakesActualResult"

module SeedClient
  module V2
    module Problem
      class FunctionSignature
        attr_reader :member, :discriminant
        private_class_method :new
        alias kind_of? is_a?
        # @param member [Object] 
        # @param discriminant [String] 
        # @return [V2::Problem::FunctionSignature] 
        def initialze(member:, discriminant:)
          # @type [Object] 
          @member = member
          # @type [String] 
          @discriminant = discriminant
        end
        # Deserialize a JSON object to an instance of FunctionSignature
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::FunctionSignature] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          case struct.type
          when "void"
            member = V2::Problem::VoidFunctionSignature.from_json(json_object: json_object)
          when "nonVoid"
            member = V2::Problem::NonVoidFunctionSignature.from_json(json_object: json_object)
          when "voidThatTakesActualResult"
            member = V2::Problem::VoidFunctionSignatureThatTakesActualResult.from_json(json_object: json_object)
          else
            member = V2::Problem::VoidFunctionSignature.from_json(json_object: json_object)
          end
          new(member: member, discriminant: struct.type)
        end
        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [] 
        def to_json
          case @discriminant
          when "void"
            { type: @discriminant, **@member.to_json() }.to_json()
          when "nonVoid"
            { type: @discriminant, **@member.to_json() }.to_json()
          when "voidThatTakesActualResult"
            { type: @discriminant, **@member.to_json() }.to_json()
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
          when "void"
            VoidFunctionSignature.validate_raw(obj: obj)
          when "nonVoid"
            NonVoidFunctionSignature.validate_raw(obj: obj)
          when "voidThatTakesActualResult"
            VoidFunctionSignatureThatTakesActualResult.validate_raw(obj: obj)
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
        # @param member [V2::Problem::VoidFunctionSignature] 
        # @return [V2::Problem::FunctionSignature] 
        def self.void(member:)
          new(member: member, discriminant: "void")
        end
        # @param member [V2::Problem::NonVoidFunctionSignature] 
        # @return [V2::Problem::FunctionSignature] 
        def self.non_void(member:)
          new(member: member, discriminant: "nonVoid")
        end
        # @param member [V2::Problem::VoidFunctionSignatureThatTakesActualResult] 
        # @return [V2::Problem::FunctionSignature] 
        def self.void_that_takes_actual_result(member:)
          new(member: member, discriminant: "voidThatTakesActualResult")
        end
      end
    end
  end
end