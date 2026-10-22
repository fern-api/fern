# frozen_string_literal: true

module Seed
  module Messages
    module Types
      class Message < Internal::Types::Model
        field :sid, -> { String }, optional: false, nullable: false

        field :body, -> { String }, optional: false, nullable: false
      end
    end
  end
end
