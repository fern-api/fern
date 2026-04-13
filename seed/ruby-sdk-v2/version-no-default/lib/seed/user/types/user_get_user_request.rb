# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserGetUserRequest < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
      end
    end
  end
end
