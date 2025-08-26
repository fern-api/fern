# frozen_string_literal: true

module Seed
  module User
    module Types
      class CreateUsernameRequest < Internal::Types::Model
        field :tags, -> { Internal::Types::Array[String] }, optional: false, nullable: false
        field :username, -> { String }, optional: false, nullable: false
        field :password, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
