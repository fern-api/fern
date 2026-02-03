# frozen_string_literal: true

module Seed
  module Types
    class Foo < Internal::Types::Model
      field :normal, -> { String }, optional: false, nullable: false
      field :read, -> { String }, optional: false, nullable: false
      field :write, -> { String }, optional: false, nullable: false
    end
  end
end
