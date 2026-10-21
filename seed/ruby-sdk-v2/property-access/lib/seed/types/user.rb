# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    # User object
    class User < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :email, -> { String }, optional: false, nullable: false

      field :password, -> { String }, optional: false, nullable: false

      field :profile, -> { Seed::Types::UserProfile }, optional: false, nullable: false
    end
  end
end
