# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class User < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :email, -> { String }, optional: false, nullable: false
    end
  end
end
