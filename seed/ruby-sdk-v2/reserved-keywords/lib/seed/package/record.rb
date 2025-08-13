# frozen_string_literal: true

module Seed
    module Types
        class Record < Internal::Types::Model
            field :foo, Internal::Types::Hash[String, String], optional: false, nullable: false
            field :_3_d, Integer, optional: false, nullable: false

    end
end
