# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserCreateUserRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :body, -> { Seed::Types::User }, optional: false, nullable: false
      end
    end
  end
end
