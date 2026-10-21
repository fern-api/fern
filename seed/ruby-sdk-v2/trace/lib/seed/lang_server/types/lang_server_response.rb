# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module LangServer
    module Types
      class LangServerResponse < Internal::Types::Model
        field :response, -> { Object }, optional: false, nullable: false
      end
    end
  end
end
