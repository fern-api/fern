# frozen_string_literal: true
require "json"
require "v_2/v_3/problem/types/TestCaseTemplateId"
require "v_2/v_3/problem/types/TestCaseImplementation"

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseImplementationReference
          attr_reader :member, :discriminant
          private_class_method :new
          alias kind_of? is_a?
          # @param member [Object] 
          # @param discriminant [String] 
          # @return [V2::V3::Problem::TestCaseImplementationReference] 
          def initialze(member:, discriminant:)
            # @type [Object] 
            @member = member
            # @type [String] 
            @discriminant = discriminant
          end
          # Deserialize a JSON object to an instance of TestCaseImplementationReference
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::TestCaseImplementationReference] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            case struct.type
            when "template_id"
              member = V2::V3::Problem::TestCaseTemplateId.from_json(json_object: json_object.value)
            when "implementation"
              member = V2::V3::Problem::TestCaseImplementation.from_json(json_object: json_object)
            else
              member = V2::V3::Problem::TestCaseTemplateId.from_json(json_object: json_object)
            end
            new(member: member, discriminant: struct.type)
          end
          # For Union Types, to_json functionality is delegated to the wrapped member.
          #
          # @return [] 
          def to_json
            case @discriminant
            when "template_id"
              { type: @discriminant, value: @member }.to_json()
            when "implementation"
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
            when "template_id"
              TestCaseTemplateId.validate_raw(obj: obj)
            when "implementation"
              TestCaseImplementation.validate_raw(obj: obj)
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
          # @param member [V2::V3::Problem::TestCaseTemplateId] 
          # @return [V2::V3::Problem::TestCaseImplementationReference] 
          def self.template_id(member:)
            new(member: member, discriminant: "template_id")
          end
          # @param member [V2::V3::Problem::TestCaseImplementation] 
          # @return [V2::V3::Problem::TestCaseImplementationReference] 
          def self.implementation(member:)
            new(member: member, discriminant: "implementation")
          end
        end
      end
    end
  end
end