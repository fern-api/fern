# frozen_string_literal: true

require_relative "resource_status"
require "json"
require_relative "user"
require_relative "organization"

module SeedMixedCaseClient
  class Service
    class Resource
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant
      # @return [SeedMixedCaseClient::Service::ResourceStatus]
      attr_reader :status

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @param status [SeedMixedCaseClient::Service::ResourceStatus]
      # @return [SeedMixedCaseClient::Service::Resource]
      def initialize(member:, discriminant:, status:)
        @member = member
        @discriminant = discriminant
        @status = status
      end

      # Deserialize a JSON object to an instance of Resource
      #
      # @param json_object [String]
      # @return [SeedMixedCaseClient::Service::Resource]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.resource_type
                 when "user"
                   SeedMixedCaseClient::Service::User.from_json(json_object: json_object)
                 when "Organization"
                   SeedMixedCaseClient::Service::Organization.from_json(json_object: json_object)
                 else
                   SeedMixedCaseClient::Service::User.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.resource_type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "user"
          { **@member.to_json, resource_type: @discriminant }.to_json
        when "Organization"
          { **@member.to_json, resource_type: @discriminant }.to_json
        else
          { "resource_type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.resource_type
        when "user"
          SeedMixedCaseClient::Service::User.validate_raw(obj: obj)
        when "Organization"
          SeedMixedCaseClient::Service::Organization.validate_raw(obj: obj)
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

      # @param member [SeedMixedCaseClient::Service::User]
      # @return [SeedMixedCaseClient::Service::Resource]
      def self.user(member:)
        new(member: member, discriminant: "user")
      end

      # @param member [SeedMixedCaseClient::Service::Organization]
      # @return [SeedMixedCaseClient::Service::Resource]
      def self.organization(member:)
        new(member: member, discriminant: "Organization")
      end
    end
  end
end
