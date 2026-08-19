# frozen_string_literal: true

module Seed
  module Types
    class UserCreatedPayload < Internal::Types::Model
      field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"

      field :email, -> { String }, optional: false, nullable: false

      field :created_at, -> { String }, optional: false, nullable: false, api_name: "createdAt"
    end
  end
end
