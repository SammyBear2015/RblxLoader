const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const UserInputService = game.GetService("UserInputService");

const player = Players.LocalPlayer;

let debounce = false;
let comboCount = 0;
const maxComboCount = 5; // Maximum number of combos before resetting
const comboResetTime = 3; // Time in seconds to reset combo count if no further input

function resetComboCount() {
	comboCount = 0;
}

function performCombo() {
	// Check if player and character exist
	if (player.Character && player.Character.IsA("Model")) {
		const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
		if (humanoid) {
			// Determine which animation to play based on the combo count
			const animationName = comboCount % 2 === 0 ? "Punch" : "Punch1";
			const animation = ReplicatedStorage.FindFirstChild("Animations")?.FindFirstChild(
				animationName,
			) as Animation;
			if (animation) {
				const loadedAnimation = humanoid.LoadAnimation(animation);
				loadedAnimation.Play();

				task.wait(0.2);

				const Event = ReplicatedStorage.WaitForChild("Remotes")
					?.WaitForChild("Combat")
					?.FindFirstChild("CombatHit") as RemoteEvent;

				Event.FireServer();

				warn(`Combo ${comboCount + 1} Initialized with ${animationName}`);
				task.wait(0.15);
				debounce = false;
			} else {
				warn(`${animationName} animation not found in ReplicatedStorage.Animations.`);
			}
		} else {
			warn("Humanoid not found in player's character.");
		}
	} else {
		warn("Player character not found.");
	}
}

// Connecting to InputBegan event
UserInputService.InputBegan.Connect((input: InputObject, gameProcessedEvent: boolean) => {
	if (gameProcessedEvent === true) {
		return;
	}

	if (input.KeyCode === Enum.KeyCode.E) {
		if (debounce) {
			return;
		}
		debounce = true;

		// Increment combo count
		comboCount++;
		performCombo();

		// Reset combo count after a delay
		spawn(() => {
			task.wait(comboResetTime);
			if (comboCount >= maxComboCount) {
				resetComboCount();
			}
			debounce = false;
		});
	}
});
