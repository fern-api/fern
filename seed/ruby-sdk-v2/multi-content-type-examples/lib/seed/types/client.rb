# frozen_string_literal: true

module Seed
  module Types
    class Client < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false

      field :email, -> { String }, optional: false, nullable: false
    end
  end
end
