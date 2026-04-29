# frozen_string_literal: true

module Seed
  module Types
    class PostSubmitRequest < Internal::Types::Model
      field :username, -> { String }, optional: false, nullable: false

      field :email, -> { String }, optional: false, nullable: false
    end
  end
end
