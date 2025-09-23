# frozen_string_literal: true

require_relative "user_profile"
require "ostruct"
require "json"

module SeedPropertyAccessClient
  # Admin user object
  class Admin
    # @return [String] The level of admin privileges.
    attr_reader :admin_level
    # @return [String] The unique identifier for the user.
    attr_reader :id
    # @return [String] The email address of the user.
    attr_reader :email
    # @return [String] The password for the user.
    attr_reader :password
    # @return [SeedPropertyAccessClient::UserProfile] User profile object
    attr_reader :profile
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param admin_level [String] The level of admin privileges.
    # @param id [String] The unique identifier for the user.
    # @param email [String] The email address of the user.
    # @param password [String] The password for the user.
    # @param profile [SeedPropertyAccessClient::UserProfile] User profile object
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPropertyAccessClient::Admin]
    def initialize(admin_level:, id:, email:, password:, profile:, additional_properties: nil)
      @admin_level = admin_level
      @id = id
      @email = email
      @password = password
      @profile = profile
      @additional_properties = additional_properties
      @_field_set = { "adminLevel": admin_level, "id": id, "email": email, "password": password, "profile": profile }
    end

    # Deserialize a JSON object to an instance of Admin
    #
    # @param json_object [String]
    # @return [SeedPropertyAccessClient::Admin]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      admin_level = parsed_json["adminLevel"]
      id = parsed_json["id"]
      email = parsed_json["email"]
      password = parsed_json["password"]
      if parsed_json["profile"].nil?
        profile = nil
      else
        profile = parsed_json["profile"].to_json
        profile = SeedPropertyAccessClient::UserProfile.from_json(json_object: profile)
      end
      new(
        admin_level: admin_level,
        id: id,
        email: email,
        password: password,
        profile: profile,
        additional_properties: struct
      )
    end

    # Serialize an instance of Admin to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.admin_level.is_a?(String) != false || raise("Passed value for field obj.admin_level is not the expected type, validation failed.")
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.email.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
      obj.password.is_a?(String) != false || raise("Passed value for field obj.password is not the expected type, validation failed.")
      SeedPropertyAccessClient::UserProfile.validate_raw(obj: obj.profile)
    end
  end
end
