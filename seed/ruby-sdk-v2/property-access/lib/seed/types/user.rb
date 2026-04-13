# frozen_string_literal: true

module Seed
  module Types
    # User object
    class User < Internal::Types::Model
      field :id, -> { String }, optional: true, nullable: false
      field :email, -> { String }, optional: true, nullable: false
      field :password, -> { String }, optional: false, nullable: false
      field :profile, -> { Seed::Types::UserProfile }, optional: false, nullable: false
    end
  end
end
