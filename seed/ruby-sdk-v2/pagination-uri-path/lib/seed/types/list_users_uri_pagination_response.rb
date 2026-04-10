# frozen_string_literal: true

module Seed
  module Types
    class ListUsersURIPaginationResponse < Internal::Types::Model
      field :data, -> { Internal::Types::Array[Seed::Types::User] }, optional: false, nullable: false
      field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
    end
  end
end
