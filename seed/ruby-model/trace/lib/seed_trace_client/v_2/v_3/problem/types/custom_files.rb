# frozen_string_literal: true

require "json"
require_relative "basic_custom_files"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class CustomFiles
          attr_reader :member, :discriminant

          private_class_method :new
          alias kind_of? is_a?
          # @param member [Object]
          # @param discriminant [String]
          # @return [V2::V3::Problem::CustomFiles]
          def initialize(member:, discriminant:)
            # @type [Object]
            @member = member
            # @type [String]
            @discriminant = discriminant
          end

          # Deserialize a JSON object to an instance of CustomFiles
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::CustomFiles]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            member = case struct.type
                     when "basic"
                       V2::V3::Problem::BasicCustomFiles.from_json(json_object: json_object)
                     when "custom"
                       json_object.value
                     else
                       V2::V3::Problem::BasicCustomFiles.from_json(json_object: json_object)
                     end
            new(member: member, discriminant: struct.type)
          end

          # For Union Types, to_json functionality is delegated to the wrapped member.
          #
          # @return [JSON]
          def to_json(*_args)
            case @discriminant
            when "basic"
              { **@member.to_json, type: @discriminant }.to_json
            when "custom"
              { "type": @discriminant, "value": @member }.to_json
            else
              { "type": @discriminant, value: @member }.to_json
            end
            @member.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            case obj.type
            when "basic"
              V2::V3::Problem::BasicCustomFiles.validate_raw(obj: obj)
            when "custom"
              obj.is_a?(Hash) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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

          # @param member [V2::V3::Problem::BasicCustomFiles]
          # @return [V2::V3::Problem::CustomFiles]
          def self.basic(member:)
            new(member: member, discriminant: "basic")
          end

          # @param member [Hash{Commons::Language => Commons::Language}]
          # @return [V2::V3::Problem::CustomFiles]
          def self.custom(member:)
            new(member: member, discriminant: "custom")
          end
        end
      end
    end
  end
end
