# frozen_string_literal: true

module Seed
  module Types
    class TestGetResponse < Internal::Types::Model
      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
