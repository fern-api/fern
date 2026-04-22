# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class GetUsersRequest < Internal::Types::Model
        field :usernames, -> { String }, optional: true, nullable: false
        field :avatar, -> { String }, optional: true, nullable: false
        field :activated, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :tags, -> { String }, optional: true, nullable: false
        field :extra, -> { Internal::Types::Boolean }, optional: true, nullable: false
      end
    end
  end
end
