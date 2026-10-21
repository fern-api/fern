# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class TestGetResponse < Internal::Types::Model
      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
