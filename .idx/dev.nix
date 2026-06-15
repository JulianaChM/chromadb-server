# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # The channel and packages from your existing configuration
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  
  # Updated application process
  processes.start = {
    command = "npm run dev";
    env = {
      # This line now points to your deployed ChromaDB on Render
      CHROMA_URL = "https://chromadb-server-durk.onrender.com";
    };
  };

  # Your existing Firebase configuration
  services.firebase.emulators = {
    detect = false;
    projectId = "demo-app";
    services = [ "auth" "firestore" ];
  };

  # This section is no longer needed as we are using a remote ChromaDB
  # services.chromadb = {
  #   build = {
  #     dockerfile = ./chromadb/Dockerfile;
  #   };
  #   port = 8000;
  # };
}
