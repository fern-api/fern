# frozen_string_literal: true

module Seed
  module User
    module Types
      class UpdateUserRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
        field :body, -> { Seed::User::Types::User }, optional: false, nullable: false
      end
    end
  end
end
