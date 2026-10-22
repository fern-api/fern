# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Memo < Internal::Types::Model
      field :description, -> { String }, optional: false, nullable: false

      field :account, -> { Seed::Types::Account }, optional: true, nullable: false
    end
  end
end
