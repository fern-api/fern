# frozen_string_literal: true

module Seed
  module User
    module Types
      class User < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :tags, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
