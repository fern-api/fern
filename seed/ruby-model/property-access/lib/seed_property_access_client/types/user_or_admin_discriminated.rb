# frozen_string_literal: true
require_relative "foo"
require "json"
require_relative "user"
require_relative "admin"

module SeedPropertyAccessClient
# Example of an discriminated union
  class UserOrAdminDiscriminated
  # @return [Object] 
    attr_reader :member
  # @return [String] 
    attr_reader :discriminant
  # @return [String] 
    attr_reader :normal
  # @return [SeedPropertyAccessClient::Foo] 
    attr_reader :foo
  # @return [String] 
    attr_reader :normal
  # @return [String] 
    attr_reader :read
  # @return [String] 
    attr_reader :write

    private_class_method :new
    alias kind_of? is_a?

    # @param member [Object] 
    # @param discriminant [String] 
    # @param normal [String] 
    # @param foo [SeedPropertyAccessClient::Foo] 
    # @param normal [String] 
    # @param read [String] 
    # @param write [String] 
    # @return [SeedPropertyAccessClient::UserOrAdminDiscriminated]
    def initialize(member:, discriminant:, normal:, foo:, normal:, read:, write:)
      @member = member
      @discriminant = discriminant
      @normal = normal
      @foo = foo
      @normal = normal
      @read = read
      @write = write
    end
# Deserialize a JSON object to an instance of UserOrAdminDiscriminated
    #
    # @param json_object [String] 
    # @return [SeedPropertyAccessClient::UserOrAdminDiscriminated]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      case struct.type
      when "user"
        member = SeedPropertyAccessClient::User.from_json(json_object: json_object)
      when "admin"
        member = SeedPropertyAccessClient::Admin.from_json(json_object: json_object.admin)
      when "empty"
        member = nil
      else
        member = SeedPropertyAccessClient::User.from_json(json_object: json_object)
      end
      new(member: member, discriminant: struct.type)
    end
# For Union Types, to_json functionality is delegated to the wrapped member.
    #
    # @return [String]
    def to_json
      case @discriminant
      when "user"
        { **@member.to_json, type: @discriminant }.to_json
      when "admin"
        { "type": @discriminant, "admin": @member }.to_json
      when "empty"
        { type: @discriminant }.to_json
      else
        { "type": @discriminant, value: @member }.to_json
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
      case obj.type
      when "user"
        SeedPropertyAccessClient::User.validate_raw(obj: obj)
      when "admin"
        SeedPropertyAccessClient::Admin.validate_raw(obj: obj)
      when "empty"
        # noop
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
    # @param member [SeedPropertyAccessClient::User] 
    # @return [SeedPropertyAccessClient::UserOrAdminDiscriminated]
    def self.user(member:)
      new(member: member, discriminant: "user")
    end
    # @param member [SeedPropertyAccessClient::Admin] 
    # @return [SeedPropertyAccessClient::UserOrAdminDiscriminated]
    def self.admin(member:)
      new(member: member, discriminant: "admin")
    end
    # @return [SeedPropertyAccessClient::UserOrAdminDiscriminated]
    def self.empty
      new(member: nil, discriminant: "empty")
    end
  end
end