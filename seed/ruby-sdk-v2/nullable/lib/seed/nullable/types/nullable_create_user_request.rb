# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class NullableCreateUserRequest < Internal::Types::Model
        field :username, -> { String }, optional: false, nullable: false
        field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :metadata, -> { Seed::Types::Metadata }, optional: true, nullable: false
        field :avatar, -> { String }, optional: true, nullable: false
      end
    end
  end
end
