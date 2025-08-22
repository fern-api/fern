# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class User < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :id, -> { String }, optional: false, nullable: false
        field :tags, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :metadata, -> { Seed::Nullable::Types::Metadata }, optional: true, nullable: false
        field :email, -> { String }, optional: false, nullable: false
        field :favorite_number, -> { Seed::Nullable::Types::WeirdNumber }, optional: false, nullable: false
        field :numbers, -> { Internal::Types::Array[Integer] }, optional: true, nullable: false
        field :strings, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
