{ pkgs, ... }: {
  # The channel and packages from your existing configuration
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  
  # Default application process
  processes.start = {
    command = "npm run dev";
  };

  # Your existing Firebase configuration
  services.firebase.emulators = {
    detect = false;
    projectId = "demo-app";
    services = [ "auth" "firestore" ];
  };
}
