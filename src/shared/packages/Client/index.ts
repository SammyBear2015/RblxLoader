const TweenService = game.GetService("TweenService");
const Workspace = game.GetService("Workspace");
const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const ContentProvider = game.GetService("ContentProvider");
const UserInputService = game.GetService("UserInputService");
const RunService = game.GetService("RunService");

const LocalPlayer = Players.LocalPlayer!;
const Wait_For_Child_Wait = 10;

const debugMode = true;

const warnClient = (...args: unknown[]) => {
	warn(":: CLIENT LOADER ::", ...args);
};

const Client = {
	Character: {
		GamePlay: {
			Camera: {
				Blobing: () => {
					const character = LocalPlayer.Character || LocalPlayer.CharacterAdded.Wait()[0];
					const humanoid = character?.WaitForChild("Humanoid") as Humanoid;

					function updateBobbleEffect(deltaTime: number) {
						const currentTime = tick();

						if (humanoid.MoveDirection.Magnitude > 0) {
							const bobbleX = math.cos(currentTime * 10) * 0.25;
							const bobbleY = math.abs(math.sin(currentTime * 10)) * 0.25;

							const bobbleZ = 0;
							if (humanoid.WalkSpeed > 18) {
								const camera = game.Workspace.CurrentCamera;
								if (camera) {
									TweenService.Create(
										camera,
										new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut),
										{ FieldOfView: 90 },
									).Play();
								}
							} else {
								const camera = game.Workspace.CurrentCamera;
								if (camera) {
									TweenService.Create(
										camera,
										new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut),
										{ FieldOfView: 70 },
									).Play();
								}
							}

							const bobble = new Vector3(bobbleX, bobbleY, bobbleZ);
							humanoid.CameraOffset = humanoid.CameraOffset.Lerp(bobble, 0.95);
						} else {
							// Gradually move CameraOffset back to zero when not moving
							humanoid.CameraOffset = humanoid.CameraOffset.Lerp(Vector3.zero, 0.95);
						}
					}

					RunService.RenderStepped.Connect((deltaTime) => {
						updateBobbleEffect(deltaTime);
					});
				},
			},
		},
	},

	Player: {
		GamePlay: {
			GUI: {
				Menu: () => {
					if (debugMode) {
						return undefined;
					}
					// Loading Menu GUI elements
					const screenGui = LocalPlayer.WaitForChild("PlayerGui").WaitForChild("LoadingGui") as ScreenGui;
					const frame = screenGui.WaitForChild("Frame") as Frame;
					const loadedText = frame.WaitForChild("LoadText") as TextLabel;
					const loadingText = frame.WaitForChild("LoadingText") as TextLabel;
					const foregroundFrame = frame.WaitForChild("Frame") as Frame;
					const loadingBarHolder = foregroundFrame.WaitForChild("Holder") as Frame;
					const loadingBar = loadingBarHolder.WaitForChild("Bar") as Frame;
					const line = loadingBar.WaitForChild("LINE") as Frame;

					frame.Visible = true;

					const tweenInfo = new TweenInfo(5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

					// Original WalkSpeed
					// eslint-disable-next-line roblox-ts/lua-truthiness
					const originalWalkSpeed = LocalPlayer.Character?.FindFirstChildOfClass("Humanoid")?.WalkSpeed || 16;

					// Update loading text
					const updateLoadingText = (assetName: string) => {
						loadingText.Text = "Loading: " + assetName;
					};

					// Update loaded assets text
					const updateLoadedAssetsText = (loaded: number, total: number) => {
						loadedText.Text = `Assets (${loaded}/${total})`;
					};

					// Load game dependencies
					const loadDependencies = () => {
						const assets = Workspace.GetDescendants();
						const totalAssets = assets.size();
						const duration = 5; // Duration for the progress bar

						// Disable walking
						if (LocalPlayer.Character) {
							const humanoid = LocalPlayer.Character.FindFirstChildOfClass("Humanoid");
							if (humanoid) {
								humanoid.WalkSpeed = 0;
							}
						}

						for (let i = 0; i < totalAssets; i++) {
							const asset = assets[i];
							updateLoadingText(asset.Name);
							updateLoadedAssetsText(i + 1, totalAssets);

							const percentage = (i + 1) / totalAssets;
							TweenService.Create(line, tweenInfo, { Size: UDim2.fromScale(percentage, 1) }).Play();
							ContentProvider.PreloadAsync([asset]);
							wait(duration / totalAssets);
						}

						loadingText.Text = "Loading Complete";
						wait(1);

						// Restore walking speed
						if (LocalPlayer.Character) {
							const humanoid = LocalPlayer.Character.FindFirstChildOfClass("Humanoid");
							if (humanoid) {
								humanoid.WalkSpeed = originalWalkSpeed;
							}
						}

						screenGui.Enabled = false;
					};

					// Start the loading process immediately
					loadDependencies();
				},
			},
		},
	},
};

export default Client;
