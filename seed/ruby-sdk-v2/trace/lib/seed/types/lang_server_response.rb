# frozen_string_literal: true

module Seed
  module Types
    class LangServerResponse < Internal::Types::Model
      field :response, -> { Object }, optional: false, nullable: false
    end
  end
end
