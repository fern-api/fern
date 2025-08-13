
module Seed
    module Types
        # Exercises all of the built-in types.
        class Type < Internal::Types::Model
            field :one, Integer, optional: false, nullable: false
            field :two, Integer, optional: false, nullable: false
            field :three, String, optional: false, nullable: false
            field :four, Internal::Types::Boolean, optional: false, nullable: false
            field :five, Integer, optional: false, nullable: false
            field :six, String, optional: false, nullable: false
            field :seven, String, optional: false, nullable: false
            field :eight, String, optional: false, nullable: false
            field :nine, String, optional: false, nullable: false
            field :ten, Internal::Types::Array[Integer], optional: false, nullable: false
            field :eleven, Internal::Types::Array[Integer], optional: false, nullable: false
            field :twelve, Internal::Types::Hash[String, Internal::Types::Boolean], optional: false, nullable: false
            field :thirteen, Integer, optional: true, nullable: false
            field :fourteen, Internal::Types::Hash[String, ], optional: false, nullable: false
            field :fifteen, Internal::Types::Array[Internal::Types::Array[Integer]], optional: false, nullable: false
            field :sixteen, Internal::Types::Array[Internal::Types::Hash[String, Integer]], optional: false, nullable: false
            field :seventeen, Internal::Types::Array[String], optional: false, nullable: false
            field :eighteen, String, optional: false, nullable: false
            field :nineteen, Seed::Name, optional: false, nullable: false
            field :twenty, Integer, optional: false, nullable: false
            field :twentyone, Integer, optional: false, nullable: false
            field :twentytwo, Integer, optional: false, nullable: false
            field :twentythree, String, optional: false, nullable: false
            field :twentyfour, String, optional: true, nullable: false
            field :twentyfive, String, optional: true, nullable: false
        end
    end
end
