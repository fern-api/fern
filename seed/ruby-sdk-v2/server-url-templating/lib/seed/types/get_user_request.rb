# frozen_string_literal: true

module Seed
  module Types
    class GetUserRequest < Internal::Types::Model
      field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
    end
  end
end
