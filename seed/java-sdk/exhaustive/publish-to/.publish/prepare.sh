# Write key ring file
echo "$MAVEN_SIGNATURE_SECRET_KEY" > armored_key.asc
gpg -o publish_key.gpg --dearmor armored_key.asc

# Generate gradle.properties file
echo "signing.keyId=$MAVEN_SIGNATURE_KID" > gradle.properties
echo "signing.secretKeyRingFile=publish_key.gpg" >> gradle.properties
echo "signing.password=$MAVEN_SIGNATURE_PASSWORD" >> gradle.properties
