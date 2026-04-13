# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserCreateUserRequest < Internal::Types::Model
        field :type, -> { Seed::User::Types::UserCreateUserRequestType }, optional: false, nullable: false, api_name: "_type"
        field :version, -> { Seed::User::Types::UserCreateUserRequestVersion }, optional: false, nullable: false, api_name: "_version"
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
