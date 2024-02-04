configPath=$1

cd /sdk
java -cp sdk.jar:lib/* com.fern.java.client.ClientGeneratorCli "$configPath"
