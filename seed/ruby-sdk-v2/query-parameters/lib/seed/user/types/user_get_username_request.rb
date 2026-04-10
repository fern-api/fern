# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserGetUsernameRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: false, nullable: false
        field :id, -> { String }, optional: false, nullable: false
        field :date, -> { String }, optional: false, nullable: false
        field :deadline, -> { String }, optional: false, nullable: false
        field :bytes, -> { String }, optional: false, nullable: false
        field :user, -> { Seed::Types::User }, optional: false, nullable: false
        field :user_list, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "userList"
        field :optional_deadline, -> { String }, optional: true, nullable: false, api_name: "optionalDeadline"
        field :key_value, -> { Internal::Types::Hash[String, String] }, optional: false, nullable: false, api_name: "keyValue"
        field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
        field :nested_user, -> { Seed::Types::NestedUser }, optional: false, nullable: false, api_name: "nestedUser"
        field :optional_user, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "optionalUser"
        field :exclude_user, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "excludeUser"
        field :filter, -> { String }, optional: true, nullable: false
      end
    end
  end
end
