const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Debris = game.GetService("Debris");
const ServerStorage = game.GetService("ServerStorage");

const Event = ReplicatedStorage.WaitForChild("Remotes")
	?.WaitForChild("Combat")
	?.FindFirstChild("CombatHit") as RemoteEvent;

Event.OnServerEvent.Connect((Player: Player) => {
	const Character = Player.Character || Player.CharacterAdded.Wait()[0];

	if (Character && Character.IsA("Model")) {
		const humanoidRootPart = Character.FindFirstChild("HumanoidRootPart");

		const Hitbox = new Instance("Part");
		Hitbox.Parent = game.Workspace;
		Hitbox.Anchored = true;
		Hitbox.CanCollide = false;
		Hitbox.Transparency = 1;
		Hitbox.Size = new Vector3(5, 5, 5);

		if (humanoidRootPart && humanoidRootPart.IsA("BasePart")) {
			// Adjust Hitbox position relative to HumanoidRootPart
			Hitbox.CFrame = humanoidRootPart.CFrame.mul(new CFrame(0, 0, -2));
		}

		Debris.AddItem(Hitbox, 2);
		const Hits: { [key: string]: boolean } = {}; // Define Hits as an object with string keys and boolean values

		Hitbox.Touched.Connect((hit) => {
			if (hit.Parent?.FindFirstChild("Humanoid") && hit.Parent.Name !== Player.Name) {
				if (!hit.Parent.FindFirstChild("Humanoid")?.FindFirstChild(Player.Name)) {
					if (!Hits[hit.Parent.Name]) {
						Hits[hit.Parent.Name] = true;

						const sound = ServerStorage.FindFirstChild("Sound")?.Clone() as Sound;
						sound.Parent = Character.FindFirstChild("Humanoid");
						sound.Play();

						Debris.AddItem(sound, 2);

						const Humanoid = hit.Parent.FindFirstChild("Humanoid") as Humanoid;
						Humanoid.TakeDamage(10);

						task.wait(4);

						Hits[hit.Parent.Name] = false;
					}
				}
			}
		});
	}
});
