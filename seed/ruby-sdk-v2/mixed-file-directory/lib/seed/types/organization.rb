# frozen_string_literal: true

module Seed
  module Types
    class Organization < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :users, -> { Internal::Types::Array[Seed::Types::User] }, optional: false, nullable: false
    end
  end
end
