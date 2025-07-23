# frozen_string_literal: true

module Api
    module Types
        # Exercises all of the built-in types.
        class Type < Internal::Types::Model
            field :one, Integer, optional: true, nullable: true
            field :two, Float, optional: true, nullable: true
            field :three, String, optional: true, nullable: true
            field :four, Boolean, optional: true, nullable: true
            field :five, Long, optional: true, nullable: true
            field :six, DateTime, optional: true, nullable: true
            field :seven, Date, optional: true, nullable: true
            field :eight, String, optional: true, nullable: true
            field :nine, String, optional: true, nullable: true
            field :ten, Array, optional: true, nullable: true
            field :eleven, Array, optional: true, nullable: true
            field :twelve, Array, optional: true, nullable: true
            field :thirteen, Array, optional: true, nullable: true
            field :fourteen, Object, optional: true, nullable: true
            field :fifteen, Array, optional: true, nullable: true
            field :sixteen, Array, optional: true, nullable: true
            field :seventeen, Array, optional: true, nullable: true
            field :eighteen, Array, optional: true, nullable: true
            field :nineteen, Name, optional: true, nullable: true
            field :twenty, Integer, optional: true, nullable: true
            field :twentyone, Long, optional: true, nullable: true
            field :twentytwo, Float, optional: true, nullable: true
            field :twentythree, String, optional: true, nullable: true
            field :twentyfour, Array, optional: true, nullable: true
            field :twentyfive, Array, optional: true, nullable: true
        end
    end
end
