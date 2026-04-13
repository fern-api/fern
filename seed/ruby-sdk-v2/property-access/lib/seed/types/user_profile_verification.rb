# frozen_string_literal: true

module Seed
  module Types
    # User profile verification object
    class UserProfileVerification < Internal::Types::Model
      field :verified, -> { String }, optional: true, nullable: false
    end
  end
end
