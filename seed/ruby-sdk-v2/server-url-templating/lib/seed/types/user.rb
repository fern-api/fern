# frozen_string_literal: true

module Seed
  module Types
    class User < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :email, -> { String }, optional: true, nullable: false
    end
  end
end
