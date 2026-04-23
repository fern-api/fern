# frozen_string_literal: true

module Seed
  module Types
    class UsersListResponse < Internal::Types::Model
      field :limit, -> { Integer }, optional: true, nullable: false
      field :count, -> { Integer }, optional: true, nullable: false
      field :has_more, -> { Internal::Types::Boolean }, optional: true, nullable: false
      field :links, -> { Internal::Types::Array[Seed::Types::Link] }, optional: false, nullable: false
      field :data, -> { Internal::Types::Array[String] }, optional: false, nullable: false
    end
  end
end
