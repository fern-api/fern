# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class UpdateProfileIdentifierResponse < Internal::Types::Model
      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
