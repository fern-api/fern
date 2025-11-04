# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersMixedTypePaginationResponse < Internal::Types::Model
        field :next_, -> { String }, optional: false, nullable: false, api_name: "next"
        field :data, -> { Internal::Types::Array[Seed::Users::Types::User] }, optional: false, nullable: false
      end
    end
  end
end
